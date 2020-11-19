import moment from 'moment';
import { ILog } from '../models/log/type';

const modActionTypes = ['removecomment', 'removelink'];
const getRandomAction = () => {
  const idx = Math.floor(Math.random() * modActionTypes.length - 1) + 1;
  return modActionTypes[idx];
};

const authors = ['homer', 'marge', 'lisa', 'bart'];

// create 1 log every week (4 logs/mo) for the past 6 months for each user
export function createMockLogs(subreddit: string): ILog[] {
  const logs: ILog[] = [];

  authors.forEach(author => {
    const today = moment().utc().startOf('day');

    for (let i = 0; i < 24; i++) {
      const isComment = Math.random() > 0.5;

      logs.unshift({
        subreddit,
        timestamp: today.subtract(1, 'week').unix() * 1000,
        action: getRandomAction(),
        redditId: 'foo',
        details: null,
        description: null,
        isComment,
        isSubmission: !isComment,
        commentId: isComment ? 'foo' : null,
        submissionId: isComment ? null : 'bar',
        link: 'http://link',
        content: 'some content',
        author,
        title: 'some title',
        mod: 'somemod',
      });
    }
  });

  return logs;
}
