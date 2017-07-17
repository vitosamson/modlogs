import { apiBaseUrl } from '../config';
import fetch from '../utils/fetch';
import { ILogsQuery, ILogsRetVal } from '../../server/routeHandlers/api/logs';

export default function logs(subreddit: string, queryParams: ILogsQuery): Promise<ILogsRetVal> {
  const query = Object.keys(queryParams)
    .filter((arg: keyof ILogsQuery) => !!queryParams[arg])
    .map((arg: keyof ILogsQuery) => `${arg}=${queryParams[arg]}`).join('&');

  return fetch(`${apiBaseUrl}/r/${subreddit}/logs?${query}`).then<ILogsRetVal>(res => {
    const retVal = res.json();
    return retVal;
  });
}

export { ILogsQuery };
