import { inspect } from 'util';
import { MongoClient, Db } from 'mongodb';
import getLogger from './logger';
import { ISubredditModlogConfig } from './models/subreddit';
import { ILog } from './models/log';

type IMongoLogQuery = {
  [key in keyof ILog]?: any;
};

const logger = getLogger('DB');
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/reddit-mod-log';
let db: Db;

export async function connectDb(): Promise<Db> {
  if (!db) {
    try {
      db = await MongoClient.connect(mongoUri);
    } catch (err) {
      logger.error('error connecting to database');
      logger.error(inspect(err));
      process.exit(1);
    }
    logger.info('connected to database');
  }

  return db;
}

export async function getDb(): Promise<Db> {
  return connectDb();
}

export function createMongoQueryFromConfig(config: ISubredditModlogConfig): IMongoLogQuery {
  const query: IMongoLogQuery = {};

  if (config.include_moderators) {
    query.mod = { $in: config.include_moderators };
  } else if (config.exclude_moderators) {
    query.mod = { $nin: config.exclude_moderators };
  }

  if (config.include_actions) {
    query.action = { $in: config.include_actions };
  } else if (config.exclude_actions) {
    query.action = { $in: config.exclude_actions };
  }

  return query;
}

export function createMongoProjectionFromConfig(config: ISubredditModlogConfig): IMongoLogQuery {
  const linkCondition = {
    $or: [
      { $and: [config.show_submission_links, { $eq: ['$isSubmission', true] }] },
      { $and: [config.show_comment_links, { $eq: ['$isComment', true] }] },
    ],
  };

  return {
    // I'd prefer not to return the db _id, but it's necessary since we need the _id
    // when determining hasBefore/hasAfter in the /logs handler
    // _id: isDevelopment ? 1 : 0,

    subreddit: 1,
    timestamp: 1,
    action: 1,
    redditId: 1,
    details: 1,
    description: 1,
    isComment: 1,
    isSubmission: 1,
    submissionId: {
      $cond: [linkCondition, '$submissionId', null],
    },
    commentId: {
      $cond: [linkCondition, '$commentId', null],
    },
    link: {
      $cond: [linkCondition, '$link', null],
    },
    content: {
      $cond: [{
        $or: [
          { $and: [config.show_submission_contents, { $eq: ['$isSubmission', true] }] },
          { $and: [config.show_comment_contents, { $eq: ['$isComment', true] }] },
        ],
      }, '$content', null],
    },
    author: {
      $cond: [{
        $or: [{
          $and: [
            config.show_submission_author,
            { $eq: ['$isSubmission', true] },
          ],
        }, {
          $and: [
            config.show_comment_author,
            { $eq: ['$isComment', true] },
          ],
        }],
      }, '$author', null],
    },
    title: {
      $cond: [{
        $and: [
          config.show_submission_title,
          { $eq: ['$isSubmission', true] },
        ],
      }, '$title', null],
    },
    mod: {
      $cond: [{
        $eq: [config.show_moderator_name, true],
      }, '$mod', null],
    },
  };
}
