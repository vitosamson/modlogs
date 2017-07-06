import { inspect } from 'util';
import { MongoClient, Db } from 'mongodb';
import getLogger from './logger';
import { ISubredditModlogConfig } from './models/subreddit';
import { ILog } from './models/log';

type IMongoLogQuery = {
  [key in keyof ILog]?: any;
};

const logger = getLogger('DB');
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost';
const dbs: { [name: string]: Db } = {};

export const ID_ASCENDING = 1;
export const ID_DESCENDING = -1;

export const enum DBNames {
  logs = 'modlogs_logs',
  internal = 'modlogs_internal',
}

export async function connectDb(dbName: DBNames): Promise<Db> {
  if (!dbs[dbName]) {
    const dbUrl = `${mongoUri}/${dbName}`;
    try {
      dbs[dbName] = await MongoClient.connect(dbUrl);
      logger.info(`connected to database at ${dbUrl}`);
    } catch (err) {
      logger.error(`error connecting to database at ${dbUrl}`);
      logger.error(inspect(err));
      process.exit(1);
    }
  }

  return dbs[dbName];
}

export async function getDb(dbName: DBNames): Promise<Db> {
  return connectDb(dbName);
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
    query.action = { $nin: config.exclude_actions };
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

  const isBanOrUnbanCondition = {
    $or: [
      { $eq: ['$action', 'banuser'] },
      { $eq: ['$action', 'unbanuser'] },
    ],
  };

  const isNotBanOrUnbanCondition = {
    $and: [
      { $ne: ['$action', 'banuser'] },
      { $ne: ['$action', 'unbanuser'] },
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
    isComment: 1,
    isSubmission: 1,
    details: {
      $cond: [{
        $or: [
          {
            $and: [
              config.show_ban_duration,
              isBanOrUnbanCondition,
            ],
          },
          isNotBanOrUnbanCondition,
        ],
      }, '$details', null],
    },
    description: {
      $cond: [{
        $or: [
          {
            $and: [
              config.show_ban_description,
              isBanOrUnbanCondition,
            ],
          },
          isNotBanOrUnbanCondition,
        ],
      }, '$description', null],
    },
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
        }, {
          $and: [
            config.show_ban_user,
            isBanOrUnbanCondition,
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
