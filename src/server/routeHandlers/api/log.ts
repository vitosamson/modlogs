import { createMongoProjectionFromConfig, createMongoQueryFromConfig } from '../../db';
import { getSubredditConfig } from '../../models/subreddit';
import { getSubredditLogsCollection, ILog } from '../../models/log';

export default async function log(subredditName: string, redditLogId: string): Promise<ILog> {
  const config = await getSubredditConfig(subredditName);
  const collection = await getSubredditLogsCollection(subredditName);
  const mongoQuery = createMongoQueryFromConfig(config);
  const projection = createMongoProjectionFromConfig(config);
  mongoQuery.redditId = redditLogId;

  const log = await collection.aggregate([])
    .match(mongoQuery)
    .limit(1)
    .project(projection)
    .next();

  if (!log) throw new Error('Could not find that log');
  return log;
}
