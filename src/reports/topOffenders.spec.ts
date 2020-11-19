import { getSubredditLogsCollection } from '../models/log';
import topOffendersReport from './topOffenders';
import { createMockLogs } from '../__mocks__/logs';

jest.mock('snoowrap');

describe('Top Offenders Report Generator', () => {
  const subreddit = 'topoffenders';

  beforeAll(async () => {
    const collection = await getSubredditLogsCollection(subreddit);
    await collection.insertMany(createMockLogs(subreddit));
  });

  afterAll(async () => {
    const collection = await getSubredditLogsCollection(subreddit);
    collection.remove({});
  });

  it('is a function', () => {
    expect(typeof topOffendersReport).toEqual('function');
  });

  it('returns logs within the specified period', async () => {
    const report = await topOffendersReport({ subreddit, period: '1 month' });
    expect(report.offenders).toHaveLength(4); // createMockLogs creates 4 logs per month
  });

  it('sorts by totalRemoved', async () => {
    const report = await topOffendersReport({ subreddit, period: '1 month' });
    const offenders = report.offenders;
    const sortedOffenders = [...offenders].sort(
      (a, b) => b.totalRemoved - a.totalRemoved
    );
    expect(offenders).toEqual(sortedOffenders);
  });

  it('excludes moderators and deleted users from the report', async () => {
    const collection = await getSubredditLogsCollection(subreddit);
    await collection.insertMany([
      {
        author: 'AutoModerator',
        action: 'removecomment',
        timestamp: Date.now(),
      },
      { author: '[deleted]', action: 'removelink', timestamp: Date.now() },
    ]);
    const report = await topOffendersReport({ subreddit, period: '1 month' });
    expect(
      report.offenders.every(
        o => o.username !== 'AutoModerator' && o.username !== '[deleted]'
      )
    ).toBe(true);
  });
});
