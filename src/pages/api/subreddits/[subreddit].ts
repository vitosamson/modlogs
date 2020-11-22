import { NextApiHandler } from 'next';
import { inspect } from 'util';
import getLogger from '../../../logger';
import { getSubreddit as _getSubreddit } from '../../../models/subreddit';
import { cleanSubredditData } from './_cleanData';

const logger = getLogger('server:subreddit');

const subredditHandler: NextApiHandler = async (req, res) => {
  try {
    res.json(_getSubreddit(req.query.subreddit as string));
  } catch (err) {
    logger.error(inspect(err));
    res.status(404).send('Could not find that subreddit');
  }
};

export default subredditHandler;

export async function getSubreddit(subredditName: string) {
  const subreddit = await _getSubreddit(subredditName);

  if (!subreddit) {
    throw new Error('Could not find that subreddit');
  }

  return cleanSubredditData(subreddit);
}
