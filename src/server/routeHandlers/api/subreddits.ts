import { getMySubreddits, ISubreddit } from '../../models/subreddit';

export default async function subreddits(): Promise<ISubreddit[]> {
  const subs = await getMySubreddits();
  return subs.map(sub => ({
    ...sub,
    modlogConfig: undefined,
  }));
}
