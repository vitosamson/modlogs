import { NextApiHandler } from 'next';
import { inspect } from 'util';
import getLogger from '../../../logger';
import { getMySubreddits } from '../../../models/subreddit';
import { cleanSubredditData } from './_cleanData';

const logger = getLogger('server:subreddits');

const subredditsHandler: NextApiHandler = async (req, res) => {
  try {
    res.json(await getSubreddits());
  } catch (err) {
    logger.error(inspect(err));
    res.json([]);
  }
};

export default subredditsHandler;

export async function getSubreddits() {
  const subreddits = await getMySubreddits();

  // Omit the config and list of moderators in the api response
  return subreddits.map(cleanSubredditData);
}
