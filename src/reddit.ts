import { inspect } from 'util';
import Snoowrap from 'snoowrap';
import {
  SnoowrapOptions,
  ModAction,
  PrivateMessage,
  RedditUser,
  Comment,
  Submission,
} from 'snoowrap';
import * as yaml from 'js-yaml';
import { OptionsWithUri as RequestOptions } from 'request';
import getLogger, { Logger } from './logger';
import { ISubreddit, ISubredditModlogConfig } from './models/subreddit/type';
import { Metric, MetricType } from './models/metric';
import { isTest } from './config';

const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;
const redditUsername = process.env.REDDIT_USER;
const redditPassword = process.env.REDDIT_PASSWORD;
const userAgent = process.env.USER_AGENT;

if (
  !isTest &&
  (!appId || !appSecret || !redditUsername || !redditPassword || !userAgent)
) {
  console.log(
    'Must provide APP_ID, APP_SECRET, REDDIT_USER, REDDIT_PASSWORD, and USER_AGENT variables.'
  );
  process.exit(1);
}

const defaultSnooOpts: SnoowrapOptions = {
  // The non-null assertion is needed only because of the !isTest check above.
  // But no requests are actually made to reddit during tests so it's fine.
  userAgent: userAgent!,
  username: redditUsername,
  password: redditPassword,
  clientId: appId,
  clientSecret: appSecret,
};

const modLogWikiPageName = 'modlog_config';

export const isComment = (fullname: string) =>
  !!fullname && fullname.startsWith('t1_');
export const isSubmission = (fullname: string) =>
  !!fullname && fullname.startsWith('t3_');

interface ThingIds {
  submissionId: string | null;
  commentId: string | null;
  subreddit: string | null;
}

const thingIdRegExp = /\/r\/(\w+)\/?(?:comments)?\/?(\w+)?\/?(?:\w+)?\/?(\w+)?/;
export function getThingIdsFromLink(link: string): ThingIds {
  const noResults: ThingIds = {
    submissionId: null,
    commentId: null,
    subreddit: null,
  };
  if (typeof link !== 'string') return noResults;
  const match = link.match(thingIdRegExp);
  if (!match || !match.length) return noResults;

  return {
    subreddit: match[1],
    submissionId: match[2] || null,
    commentId: match[3] || null,
  };
}

// extract a username from /u/username or u/username
export const parseUsername = (username: string): string => {
  const match: string[] = /(?:u\/)?(\w+)/.exec(username) || [];
  return match[1] || username;
};

// override snoowrap's rawRequest so we can record the reddit api requests
class SnoowrapWithMetrics extends Snoowrap {
  constructor(options: SnoowrapOptions, logger: Logger) {
    super(options);
    this.logger = logger;
  }

  private logger: Logger;

  public rawRequest(options: RequestOptions): Promise<any> {
    let metric: Metric;
    if (
      Metric.metricsEnabled &&
      options &&
      options.uri !== 'api/v1/access_token'
    ) {
      metric = new Metric(MetricType.redditApi, {
        baseUrl: options.baseUrl,
        uri: options.uri,
        method: options.method,
        qs: options.qs,
        body: options.form,
      });
    }

    return super
      .rawRequest(options)
      .then((res: any) => {
        if (metric) {
          metric.report(null, {
            rateLimitRemaining: this.ratelimitRemaining,
          });
        }

        this.logger.info(
          `Rate limit remaining: ${this.ratelimitRemaining} (${options.uri})`
        );

        return Promise.resolve(res);
      })
      .catch((err: any) => {
        if (metric)
          metric.report(
            {
              status: err.statusCode,
              message: err.message,
            },
            {
              rateLimitRemaining: this.ratelimitRemaining,
            }
          );

        this.logger.info(
          `Rate limit remaining: ${this.ratelimitRemaining} (${options.uri})`
        );

        return Promise.reject(err);
      });
  }
}

export class Reddit {
  constructor(opts?: SnoowrapOptions) {
    const options: SnoowrapOptions = { ...defaultSnooOpts, ...opts };
    this.r = new SnoowrapWithMetrics(options, this.logger);
    this.logger.info(`Running as reddit user ${options.username}`);
    this.logger.info(`Running under app id ${options.clientId}`);
    this.r.config({
      proxies: false,

      // time in ms to wait between requests to reduce the likelihood that we hit reddit's
      // rate limit. this may need to be increased to 1000.
      requestDelay: 500,
    });
  }

  private r: Snoowrap;
  private logger = getLogger('reddit');

  public async getModdedSubreddits(): Promise<ISubreddit[]> {
    const subs = await (await this.r.getModeratedSubreddits()).fetchAll();
    const formattedSubs: ISubreddit[] = subs.map(sub => ({
      id: sub.id,
      name: sub.display_name,
      nameLowercase: sub.display_name.toLowerCase(),
      description: sub.description,
      shortDescription: sub.public_description,
      title: sub.title,
      created: sub.created_utc * 1000,
      subscribers: sub.subscribers,
    }));
    return formattedSubs;
  }

  public async getSubredditConfig(
    subreddit: string
  ): Promise<ISubredditModlogConfig | null> {
    try {
      const config = await this.r
        .getSubreddit(subreddit)
        .getWikiPage(modLogWikiPageName)
        .fetch()
        .then(res => {
          return yaml.safeLoad(res.content_md) as ISubredditModlogConfig;
        });
      return config;
    } catch (err) {
      return null;
    }
  }

  public getThingIdsFromLink(link: string) {
    return getThingIdsFromLink(link);
  }

  public async getInboxMessages(): Promise<PrivateMessage[]> {
    try {
      return (await this.r.getUnreadMessages()).fetchAll();
    } catch (err) {
      this.logger.error(inspect(err));
      return [];
    }
  }

  public async sendMessage({
    to,
    subject,
    content,
  }: {
    to: string;
    subject: string;
    content: string;
  }) {
    try {
      await this.r.composeMessage({
        to,
        subject,
        text: content,
      });
    } catch (err) {
      this.logger.error(inspect(err));
    }
  }

  public async markMessagesRead(
    messageFullNames: PrivateMessage[] | string[]
  ): Promise<void> {
    try {
      await this.r.markMessagesAsRead(messageFullNames);
    } catch (err) {
      this.logger.error(inspect(err));
    }
  }

  public async getSubredditModLogs(
    subredditName: string,
    opts: { after?: string; before?: string }
  ): Promise<ModAction[]> {
    try {
      return (
        await this.r.getSubreddit(subredditName).getModerationLog(opts)
      ).fetchAll();
    } catch (err) {
      this.logger.error(inspect(err));
      return [];
    }
  }

  public async getSubredditModerators(
    subredditName: string
  ): Promise<RedditUser[]> {
    try {
      return await this.r.getSubreddit(subredditName).getModerators();
    } catch (err) {
      this.logger.error(err);
      return [];
    }
  }

  public async getUserComments(username: string): Promise<Comment[]> {
    try {
      return (await this.r.getUser(username).getComments()).fetchAll();
    } catch (err) {
      this.logger.error(inspect(err));
      return [];
    }
  }

  public async getUserSubmissions(username: string): Promise<Submission[]> {
    try {
      return (await this.r.getUser(username).getSubmissions()).fetchAll();
    } catch (err) {
      this.logger.error(inspect(err));
      return [];
    }
  }

  public acceptModeratorInvite(subreddit: string) {
    return this.r.getSubreddit(subreddit).acceptModeratorInvite();
  }
}

export default new Reddit();
