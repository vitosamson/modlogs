import { inspect } from 'util';
import { Response } from 'express';
import reddit, { parseUsername } from '../../reddit';
import { createMongoQueryFromConfig, createMongoProjectionFromConfig, ID_ASCENDING, ID_DESCENDING } from '../../db';
import { getSubredditConfig } from '../../models/subreddit';
import getLogger from '../../logger';
import { getSubredditLogsCollection, ILog } from '../../models/log';
import { AuthenticatedRequest } from '../modLoginMiddleware';

const logger = getLogger('server');

export interface ILogsQuery {
  limit?: number | string;
  after?: string;
  before?: string;
  link?: string;
  actions?: string;
  type?: 'comments' | 'submissions';
  author?: string;
  mod?: string;
}

export interface ILogsRetVal {
  logs: ILog[];
  after: string | null;
  before: string | null;
  isAuthenticatedMod: boolean;
}

const noLogs = (isAuthenticatedMod: boolean): ILogsRetVal => ({
  logs: [],
  after: null,
  before: null,
  isAuthenticatedMod,
});

export default async function logsHandler(req: AuthenticatedRequest, res: Response) {
  const isAuthenticatedMod = req.__isAuthenticatedMod;

  try {
    res.json(await logs(req.params.subreddit, req.query, isAuthenticatedMod));
  } catch (err) {
    logger.error(inspect(err));
    res.json(noLogs(isAuthenticatedMod));
  }
}

export async function logs(subredditName: string, query: ILogsQuery, isAuthenticatedMod = false): Promise<ILogsRetVal> {
  const config = await getSubredditConfig(subredditName, isAuthenticatedMod);
  const collection = await getSubredditLogsCollection(subredditName);
  const limit = Math.min((typeof query.limit === 'string' ? parseInt(query.limit, 10) : query.limit || 25), 100);
  const mongoQuery = createMongoQueryFromConfig(config);
  const projection = createMongoProjectionFromConfig(config);
  const sort = {
    _id: ID_DESCENDING,
  };

  if (query.after) {
    const after = await collection.findOne({ redditId: query.after });
    if (after) {
      mongoQuery._id = {
        $lt: after._id,
      };
    }
  } else if (query.before) {
    const before = await collection.findOne({ redditId: query.before });
    if (before) {
      mongoQuery._id = {
        $gt: before._id,
      };
      sort._id = ID_ASCENDING;
    }
  }

  // if the user is an authenticated mod, config.show_comment_links and config.show_submission_links will be true,
  // so no need for an isAuthenticatedMod check here
  if (query.link) {
    const { submissionId, commentId } = reddit.getThingIdsFromLink(query.link);
    if (commentId && config.show_comment_links) {
      mongoQuery.commentId = commentId;
    } else if (submissionId && config.show_submission_links) {
      mongoQuery.submissionId = submissionId;
    } else {
      return noLogs(isAuthenticatedMod);
    }
  }

  if (query.actions) {
    mongoQuery.action = {
      $in: query.actions.split(',').map((action: string) => action.trim()),
    };
  }

  if (query.type) {
    if (query.type === 'submissions') mongoQuery.isSubmission = true;
    else if (query.type === 'comments') mongoQuery.isComment = true;
  }

  // queries that are only available to authenticated mods for the current subreddit
  if (isAuthenticatedMod) {
    if (query.author) mongoQuery.author = new RegExp(parseUsername(query.author), 'i');
    if (query.mod) mongoQuery.mod = new RegExp(parseUsername(query.mod), 'i');
  }

  logger.debug(inspect(mongoQuery));

  const aggregation = collection.aggregate<ILog>([])
    .match(mongoQuery)
    .sort(sort)
    .limit(limit)
    .project(projection);

  let logs = await aggregation.toArray();
  if (query.before && mongoQuery._id) logs = logs.reverse();

  const first = logs[0];
  const last = logs[logs.length - 1];

  const hasAfter = last && await collection.find(Object.assign({}, mongoQuery, {
    _id: { $lt: last._id },
  })).sort({
    _id: ID_ASCENDING,
  }).limit(limit).hasNext();

  const hasBefore = first && await collection.find(Object.assign({}, mongoQuery, {
    _id: { $gt: first._id },
  })).sort({
    _id: ID_DESCENDING,
  }).limit(limit).hasNext();

  return {
    logs,
    after: hasAfter ? last.redditId : null,
    before: hasBefore ? first.redditId : null,
    isAuthenticatedMod,
  };
}
