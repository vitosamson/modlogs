import { Response } from 'express';
import { inspect } from 'util';
import { createMongoProjectionFromConfig, createMongoQueryFromConfig } from '../../db';
import { getSubredditConfig } from '../../models/subreddit';
import { getSubredditLogsCollection, ILog } from '../../models/log';
import { AuthenticatedRequest } from '../modLoginMiddleware';
import getLogger from '../../logger';

const logger = getLogger('server');

export default async function logHandler(req: AuthenticatedRequest, res: Response) {
  try {
    res.json(await log(req.params.subreddit, req.params.redditLogId, req.__isAuthenticatedMod));
  } catch (err) {
    logger.error(inspect(err));
    res.status(404).send(err.message);
  }
}

export async function log(subredditName: string, redditLogId: string, isAuthenticatedMod = false): Promise<ILog> {
  const config = await getSubredditConfig(subredditName, isAuthenticatedMod);
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
