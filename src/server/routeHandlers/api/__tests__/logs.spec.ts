import * as moment from 'moment';
import { getSubredditLogsCollection } from '../../../models/log';
import { getMySubredditsCollection, ISubredditModlogConfig } from '../../../models/subreddit';
import { logs as logsApi } from '../logs';

describe('/api/logs', () => {
  const subreddit = 'logsApiTest';
  const updateConfig = async (config: ISubredditModlogConfig) => (
    (await getMySubredditsCollection()).updateOne(
      { name: subreddit },
      { name: subreddit, modlogConfig: config },
      { upsert: true }
    )
  );

  beforeAll(async () => {
    const collection = await getSubredditLogsCollection(subreddit);
    const today = moment().utc().startOf('day');
    const timestamp = () => today.subtract(1, 'day').unix() * 1000;
    await collection.insertMany([
      { subreddit, timestamp: timestamp(), action: 'removecomment', mod: 'somemod', content: 'foo', redditId: '4', commentId: '1', isComment: true },
      { subreddit, timestamp: timestamp(), action: 'approvecomment', mod: 'someothermod', content: 'bar', redditId: '3', commentId: '2', isComment: true },
      { subreddit, timestamp: timestamp(), action: 'removelink', mod: 'somemod', content: 'foo', redditId: '2', submissionId: '1', isSubmission: true },
      { subreddit, timestamp: timestamp(), action: 'approvelink', mod: 'someothermod', content: 'bar', redditId: '1', submissionId: '2', isSubmission: true },
    ]);
  });

  afterAll(async () => {
    await (await getSubredditLogsCollection(subreddit)).remove({});
    await (await getMySubredditsCollection()).remove({});
  });

  it('returns the logs', async () => {
    const { logs, before, after } = await logsApi(subreddit, {});
    expect(logs).toHaveLength(4);
    expect(before).toBeNull();
    expect(after).toBeNull();
  });

  it('query.limit', async () => {
    const { logs, before, after } = await logsApi(subreddit, { limit: 2 });
    expect(logs).toHaveLength(2);
    expect(logs[0].redditId).toEqual('1');
    expect(logs[1].redditId).toEqual('2');
    expect(before).toBeNull();
    expect(after).toEqual('2');
  });

  it('query.after', async () => {
    const { logs, before, after } = await logsApi(subreddit, { after: '2' });
    expect(logs).toHaveLength(2);
    expect(logs[0].redditId).toEqual('3');
    expect(logs[1].redditId).toEqual('4');
    expect(before).toEqual('3');
    expect(after).toBeNull();
  });

  it('query.before', async () => {
    const { logs, before, after } = await logsApi(subreddit, { before: '3' });
    expect(logs).toHaveLength(2);
    expect(logs[0].redditId).toEqual('1');
    expect(logs[1].redditId).toEqual('2');
    expect(before).toBeNull();
    expect(after).toEqual('2');
  });

  it('query.actions', async () => {
    const { logs, before, after } = await logsApi(subreddit, { actions: 'removecomment, removelink' });
    expect(logs).toHaveLength(2);
    expect(logs[0].redditId).toEqual('2');
    expect(logs[1].redditId).toEqual('4');
    expect(before).toBeNull();
    expect(after).toBeNull();
  });

  it('query.type=submissions', async () => {
    const { logs, before, after } = await logsApi(subreddit, { type: 'submissions' });
    expect(logs).toHaveLength(2);
    expect(logs.every(l => l.isSubmission === true)).toBeTruthy();
    expect(before).toBeNull();
    expect(after).toBeNull();
  });

  it('query.type=comments', async () => {
    const { logs, before, after } = await logsApi(subreddit, { type: 'comments' });
    expect(logs).toHaveLength(2);
    expect(logs.every(l => l.isComment === true)).toBeTruthy();
    expect(before).toBeNull();
    expect(after).toBeNull();
  });

  describe('query.link', () => {
    it('by commentId with show_comment_links=false', async () => {
      await updateConfig({ show_comment_links: false });
      const { logs, before, after } = await logsApi(subreddit, { link: `/r/${subreddit}/comments/foo/_/1`});
      expect(logs).toHaveLength(0);
      expect(before).toBeNull();
      expect(after).toBeNull();
    });

    it('by commentId with show_comment_links=true', async () => {
      await updateConfig({ show_comment_links: true });
      const { logs, before, after } = await logsApi(subreddit, { link: `/r/${subreddit}/comments/foo/_/1` });
      expect(logs).toHaveLength(1);
      expect(logs[0].redditId).toEqual('4');
      expect(before).toBeNull();
      expect(after).toBeNull();
    });

    it('by submissionId with show_submission_links=false', async () => {
      await updateConfig({ show_submission_links: false });
      const { logs, before, after } = await logsApi(subreddit, { link: `/r/${subreddit}/comments/1` });
      expect(logs).toHaveLength(0);
      expect(before).toBeNull();
      expect(after).toBeNull();
    });

    it('by submissionId with show_submission_links=true', async () => {
      await updateConfig({ show_submission_links: true });
      const { logs, before, after } = await logsApi(subreddit, { link: `/r/${subreddit}/comments/1` });
      expect(logs).toHaveLength(1);
      expect(logs[0].redditId).toEqual('2');
      expect(before).toBeNull();
      expect(after).toBeNull();
    });
  });

  describe('query.author', () => {
    beforeAll(async () => {
      await (await getSubredditLogsCollection(subreddit)).insertMany([
        { subreddit, author: 'theuser', content: 'foo' },
      ]);
    });

    it('authenticated mod', async () => {
      // make sure it does a case-insensitive search
      const { logs } = await logsApi(subreddit, { author: 'TheUser' }, true);
      expect(logs).toHaveLength(1);
    });

    it('unauthenticated', async () => {
      const { logs } = await logsApi(subreddit, { author: 'TheUser'}, false);
      expect(logs).not.toHaveLength(1);
    });

    it('works when the username is prepended by /u/ or u/', async () => {
      let { logs } = await logsApi(subreddit, { author: '/u/TheUser' }, true);
      expect(logs).toHaveLength(1);
      logs = (await logsApi(subreddit, { author: 'u/theUser' }, true)).logs;
      expect(logs).toHaveLength(1);
    });
  });

  describe('query.mod', () => {
    beforeAll(async () => {
      await (await getSubredditLogsCollection(subreddit)).insertMany([
        { subreddit, mod: 'themod' },
      ]);
    });

    it('authenticated mod', async () => {
      const { logs } = await logsApi(subreddit, { mod: 'TheMod' }, true);
      expect(logs).toHaveLength(1);
    });

    it('unauthenticated', async () => {
      const { logs } = await logsApi(subreddit, { mod: 'TheMod' }, false);
      expect(logs).not.toHaveLength(1);
    });

    it('works when the username is prepended by /u/ or u/', async () => {
      let { logs } = await logsApi(subreddit, { mod: '/u/theMod' }, true);
      expect(logs).toHaveLength(1);
      logs = (await logsApi(subreddit, { mod: 'u/Themod' }, true)).logs;
      expect(logs).toHaveLength(1);
    });
  });
});
