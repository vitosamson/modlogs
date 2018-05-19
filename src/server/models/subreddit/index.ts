import { Collection } from 'mongodb';
import { getDb, DBNames } from '../../db';
import { ISubreddit, ISubredditModlogConfig } from './type';

const subredditsCollectionName = 'subreddits';
const isDevelopment = process.env.NODE_ENV === 'development';

// config items that are expected to be arrays of lowercase strings, which get normalized in getSubredditConfig
const configArrayItems: Array<keyof ISubredditModlogConfig> = [
  'include_moderators', 'exclude_moderators', 'include_actions', 'exclude_actions',
];

export async function getMySubredditsCollection(): Promise<Collection> {
  const db = await getDb(DBNames.internal);
  return db.collection(subredditsCollectionName);
}

export async function getMySubreddits(): Promise<ISubreddit[]> {
  const collection = await getMySubredditsCollection();
  return collection.find<ISubreddit>().toArray();
}

export async function getSubreddit(name: string): Promise<ISubreddit> {
  const collection = await getMySubredditsCollection();
  return collection.findOne({ name: new RegExp(name, 'i') });
}

function createDefaultModlogConfig(isAuthenticatedMod = false): ISubredditModlogConfig {
  return {
    show_comment_links: isDevelopment || isAuthenticatedMod,
    show_submission_links: isDevelopment || isAuthenticatedMod,
    show_comment_contents: true,
    show_submission_contents: true,
    show_comment_author: isDevelopment || isAuthenticatedMod,
    show_submission_author: isDevelopment || isAuthenticatedMod,
    show_submission_title: true,
    show_moderator_name: isDevelopment || isAuthenticatedMod,
    show_ban_user: true,
    show_ban_duration: true,
    show_ban_description: isDevelopment || isAuthenticatedMod,
    include_actions: null,
    exclude_actions: null,
    include_moderators: null,
    exclude_moderators: null,
    show_automod_action_reasons: isDevelopment || isAuthenticatedMod,
    show_muted_user: isDevelopment || isAuthenticatedMod,
  };
}

export async function getSubredditConfig(subredditName: string, isAuthenticatedMod = false): Promise<ISubredditModlogConfig> {
  const defaultConfig = createDefaultModlogConfig(isAuthenticatedMod);

  // if the user is logged in as a mod, they bypass any config restrictions
  if (isAuthenticatedMod) return defaultConfig;

  const subreddit = await getSubreddit(subredditName);

  if (!subreddit || !subreddit.modlogConfig) return defaultConfig;

  const config = subreddit.modlogConfig;
  configArrayItems.map(thing => {
    if (config[thing]) {
      if (!Array.isArray(config[thing])) {
        config[thing] = [];
      }

      config[thing] = (config[thing] as string[]).map(item => {
        return typeof item === 'string' ? item.toLowerCase() : '';
      });
    }
  });

  return {
    ...defaultConfig,
    ...config,
  };
}

export { ISubreddit, ISubredditModlogConfig };
