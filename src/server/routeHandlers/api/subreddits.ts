import { getMySubreddits, ISubreddit } from '../../models/subreddit';

export default async function subreddits(): Promise<ISubreddit[]> {
  return getMySubreddits();
}
