import { ISubreddit } from '../../../models/subreddit';
import { omit } from '../../../utils';

// Omit the config and list of moderators in the api response
export function cleanSubredditData(subreddit: ISubreddit) {
  return omit(subreddit, ['modlogConfig', 'moderators', '_id']);
}
