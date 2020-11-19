import { Collection } from 'mongodb';
import { getDb, DBNames } from '../../db';
import { ILog } from './type';

export async function getSubredditLogsCollection(
  subreddit: string
): Promise<Collection> {
  const db = await getDb(DBNames.logs);
  const collection = db.collection(subreddit.toLowerCase());
  return collection;
}

export async function createSubredditIndexes(subreddit: string): Promise<void> {
  const db = await getDb(DBNames.logs);
  const collection = db.collection(subreddit);
  await collection.createIndexes([{ timestamp: 1 }, { redditId: 1 }]);
}

export type { ILog };
