import { apiBaseUrl } from '../config';
import { ILog } from '../../server/models/log/type';

export default function log(subredditName: string, redditLogId: string): Promise<ILog> {
  return fetch(`${apiBaseUrl}/r/${subredditName}/logs/${redditLogId}`).then<ILog>(res => {
    if (res.ok) return res.json();
    throw res;
  });
}
