import { apiBaseUrl } from '../config';
import { ISubreddit } from '../../server/models/subreddit/type';

export default function subreddits(): Promise<ISubreddit[]> {
  return fetch(`${apiBaseUrl}/subreddits`).then(res => {
    if (res.ok) return res.json();
    throw res;
  }).catch(err => {
    return [];
  });
}
