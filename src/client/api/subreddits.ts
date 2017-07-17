import { apiBaseUrl } from '../config';
import fetch from '../utils/fetch';
import { ISubreddit } from '../../server/models/subreddit/type';

export default function subreddits(): Promise<ISubreddit[]> {
  return fetch(`${apiBaseUrl}/subreddits`).then(res => {
    return res.json();
  }).catch(err => {
    return [];
  });
}
