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

export const DBNames = Object.freeze({
  logs: 'modlogs_logs',
  internal: 'modlogs_internal',
} as const);
type K = keyof typeof DBNames;

export async function connectDb(dbName: typeof DBNames[K]): Promise<Db> {
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

export async function getDb(dbName: typeof DBNames[K]): Promise<Db> {
  return connectDb(dbName);
}

// this ensures that a config such as { include_moderators: [] } doesn't add { mod: { $in: [] } }
// to the mongo query, which will result in no logs being returned at all
const checkArrayConfigItem = (
  config: ISubredditModlogConfig,
  key: keyof ISubredditModlogConfig
): boolean => {
  return Array.isArray(config[key]) && (config[key] as any[]).length > 0;
};

export function createMongoQueryFromConfig(
  config: ISubredditModlogConfig
): IMongoLogQuery {
  const query: IMongoLogQuery = {};

  if (checkArrayConfigItem(config, 'include_moderators')) {
    query.mod = { $in: config.include_moderators };
  } else if (checkArrayConfigItem(config, 'exclude_moderators')) {
    query.mod = { $nin: config.exclude_moderators };
  }

  if (checkArrayConfigItem(config, 'include_actions')) {
    query.action = { $in: config.include_actions };
  } else if (checkArrayConfigItem(config, 'exclude_actions')) {
    query.action = { $nin: config.exclude_actions };
  }

  return query;
}

export function createMongoProjectionFromConfig(
  config: ISubredditModlogConfig
): IMongoLogQuery {
  const linkCondition = {
    $or: [
      {
        $and: [config.show_submission_links, { $eq: ['$isSubmission', true] }],
      },
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
    isComment: 1,
    isSubmission: 1,
    details: {
      $cond: [
        {
          $eq: ['$action', 'wikirevise'],
        },
        '$details',
        null,
      ],
    },
    bannedUser: {
      $cond: [
        {
          $and: [
            config.show_ban_user,
            {
              $or: [
                { $eq: ['$action', 'banuser'] },
                { $eq: ['$action', 'unbanuser'] },
              ],
            },
          ],
        },
        '$author',
        null,
      ],
    },
    banDuration: {
      $cond: [
        {
          $and: [config.show_ban_duration, { $eq: ['$action', 'banuser'] }],
        },
        '$details',
        null,
      ],
    },
    banDescription: {
      $cond: [
        {
          $and: [
            config.show_ban_description,
            {
              $or: [
                { $eq: ['$action', 'banuser'] },
                { $eq: ['$action', 'unbanuser'] },
              ],
            },
          ],
        },
        '$description',
        null,
      ],
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
      $cond: [
        {
          $or: [
            {
              $and: [
                config.show_submission_contents,
                { $eq: ['$isSubmission', true] },
              ],
            },
            {
              $and: [
                config.show_comment_contents,
                { $eq: ['$isComment', true] },
              ],
            },
          ],
        },
        '$content',
        null,
      ],
    },
    author: {
      $cond: [
        {
          $or: [
            {
              $and: [
                config.show_submission_author,
                { $eq: ['$isSubmission', true] },
              ],
            },
            {
              $and: [config.show_comment_author, { $eq: ['$isComment', true] }],
            },
          ],
        },
        '$author',
        null,
      ],
    },
    title: {
      $cond: [
        {
          $and: [
            config.show_submission_title,
            { $eq: ['$isSubmission', true] },
          ],
        },
        '$title',
        null,
      ],
    },
    mod: {
      $cond: [
        {
          $eq: [config.show_moderator_name, true],
        },
        '$mod',
        null,
      ],
    },
    automodActionReason: {
      $cond: [
        {
          $and: [
            config.show_automod_action_reasons,
            { $eq: ['$mod', 'AutoModerator'] },
          ],
        },
        '$details',
        null,
      ],
    },
    mutedUser: {
      $cond: [
        {
          $and: [
            config.show_muted_user,
            {
              $or: [
                { $eq: ['$action', 'muteuser'] },
                { $eq: ['$action', 'unmuteuser'] },
              ],
            },
          ],
        },
        '$author',
        null,
      ],
    },
  };
}
