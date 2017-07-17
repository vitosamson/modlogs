import { Request, Response } from 'express';
import { inspect } from 'util';
import { getMySubreddits, ISubreddit } from '../../models/subreddit';
import getLogger from '../../logger';

const logger = getLogger('server');

export default async function subredditsHandler(req: Request, res: Response) {
  try {
    res.json(await subreddits());
  } catch (err) {
    logger.error(inspect(err));
    res.json([]);
  }
}

export async function subreddits(): Promise<ISubreddit[]> {
  const subs = await getMySubreddits();
  return subs.map(clearInternalData);
}

// don't return the config or list of moderators in the api response
function clearInternalData(subreddit: ISubreddit): ISubreddit {
  return {
    ...subreddit,
    modlogConfig: undefined,
    moderators: undefined,
  };
}
