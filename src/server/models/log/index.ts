import { Collection } from 'mongodb';
import { getDb } from '../../db';
import { ILog } from './type';

export async function getSubredditLogsCollection(subreddit: string): Promise<Collection> {
  const db = await getDb();
  const collection = await db.collection(subreddit.toLowerCase());

  // create the indices if they don't exist
  await collection.createIndex({ timestamp: 1 });
  await collection.createIndex({ redditId: 1 });

  return collection;
}

export { ILog };
