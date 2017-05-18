import { apiBaseUrl } from '../config';
import { ILogsQuery, ILogsRetVal } from '../../server/routeHandlers/api/logs';

export default function logs(subreddit: string, queryParams: ILogsQuery): Promise<ILogsRetVal> {
  const query = Object.keys(queryParams)
    .filter((arg: keyof ILogsQuery) => !!queryParams[arg])
    .map((arg: keyof ILogsQuery) => `${arg}=${queryParams[arg]}`).join('&');

  return fetch(`${apiBaseUrl}/r/${subreddit}/logs?${query}`).then<ILogsRetVal>(res => {
    if (res.ok) {
      const retVal = res.json();
      return retVal;
    }
    throw res;
  });
}
