import { NextApiHandler } from 'next';
import { inspect } from 'util';
import getLogger from '../../../logger';
import { getSubreddit } from '../../../models/subreddit';
import { cleanSubredditData } from './_cleanData';

const logger = getLogger('server:subreddit');

const subredditHandler: NextApiHandler = async (req, res) => {
  try {
    const sub = await getSubreddit(req.query.subreddit as string);

    if (sub) {
      res.json(cleanSubredditData(sub));
    } else {
      res.status(404).send('Could not find that subreddit');
    }
  } catch (err) {
    logger.error(inspect(err));
    res.status(500).send(err.message);
  }
};

export default subredditHandler;
