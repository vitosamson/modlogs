import { NextApiHandler } from 'next';
import { inspect } from 'util';
import {
  createMongoProjectionFromConfig,
  createMongoQueryFromConfig,
} from '../../../../db';
import getLogger from '../../../../logger';
import { getSubredditLogsCollection, ILog } from '../../../../models/log';
import { getSubredditConfig } from '../../../../models/subreddit';
import { getAuthStatus } from '../../../../utils/getAuthStatus';

const logger = getLogger('server:log');

const logHandler: NextApiHandler = async (req, res) => {
  const logId = req.query.logId as string;
  const subredditName = req.query.subreddit as string;
  const { isAuthenticatedMod } = await getAuthStatus(req, subredditName);

  try {
    res.json(await getLog(subredditName, logId, isAuthenticatedMod));
  } catch (err) {
    logger.error(inspect(err));
    res.status(404).send(err.message);
  }
};

export default logHandler;

export const getLog = async (
  subredditName: string,
  logId: string,
  isAuthenticatedMod: boolean
) => {
  const config = await getSubredditConfig(subredditName, isAuthenticatedMod);
  const collection = await getSubredditLogsCollection(subredditName);
  const mongoQuery = createMongoQueryFromConfig(config);
  const projection = createMongoProjectionFromConfig(config);
  mongoQuery.redditId = logId;

  const log: ILog = await collection
    .aggregate([])
    .match(mongoQuery)
    .limit(1)
    .project(projection)
    .next();

  if (!log) {
    throw new Error('Could not find that log');
  }

  log._id = log._id?.toString();

  return log;
};
