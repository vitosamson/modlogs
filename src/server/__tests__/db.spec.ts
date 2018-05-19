import { Collection } from 'mongodb';
import { createMongoQueryFromConfig, createMongoProjectionFromConfig } from '../db';
import { getSubredditLogsCollection, ILog } from '../models/log';
import { ISubredditModlogConfig } from '../models/subreddit';

describe('createMongoQueryFromConfig', () => {
  it('includes the specified moderators', () => {
    const query = createMongoQueryFromConfig({
      include_moderators: ['foo', 'bar'],
    });
    expect(query.mod).toEqual({
      $in: ['foo', 'bar'],
    });
  });

  it('excludes the specified moderators', () => {
    const query = createMongoQueryFromConfig({
      exclude_moderators: ['foo', 'bar'],
    });
    expect(query.mod).toEqual({
      $nin: ['foo', 'bar'],
    });
  });

  it('includes the specified actions', () => {
    const query = createMongoQueryFromConfig({
      include_actions: ['foo', 'bar'],
    });
    expect(query.action).toEqual({
      $in: ['foo', 'bar'],
    });
  });

  it('excludes the specified actions', () => {
    const query = createMongoQueryFromConfig({
      exclude_actions: ['foo', 'bar'],
    });
    expect(query.action).toEqual({
      $nin: ['foo', 'bar'],
    });
  });
});

describe('createMongoProjectionFromConfig', () => {
  const subreddit = 'projectiontest';
  const doQuery = (c: ISubredditModlogConfig): Promise<ILog[]> =>
    collection.aggregate([{ $project: createMongoProjectionFromConfig(c) }]).toArray();
  const createFilter = (by: keyof ILog) => (logs: ILog[]) => logs.filter(l => !!l[by]);
  let collection: Collection;

  beforeAll(async () => {
    collection = await getSubredditLogsCollection(subreddit);
  });

  afterEach(async () => {
    await collection.remove({});
  });

  it('submissionId', async () => {
    const filter = createFilter('submissionId');
    await collection.insertMany([
      { isSubmission: true, submissionId: 'foo' },
      { isSubmission: false, commentId: 'bar' },
    ]);

    let logs = await doQuery({ show_submission_links: true });
    expect(filter(logs)).toHaveLength(1);
    expect(filter(logs)[0].submissionId).toEqual('foo');

    logs = await doQuery({ show_submission_links: false });
    expect(filter(logs)).toHaveLength(0);
  });

  it('commentId', async () => {
    const filter = createFilter('commentId');
    await collection.insertMany([
      { isComment: true, commentId: 'foo' },
      { isComment: false, commentId: 'bar' },
    ]);

    let logs = await doQuery({ show_comment_links: true });
    expect(filter(logs)).toHaveLength(1);
    expect(filter(logs)[0].commentId).toEqual('foo');

    logs = await doQuery({ show_comment_links: false });
    expect(filter(logs)).toHaveLength(0);
  });

  it('link', async () => {
    const filter = createFilter('link');
    await collection.insertMany([
      { isSubmission: true, link: 'foo' },
      { isComment: true, link: 'bar' },
      { isSubmission: false, isComment: false, link: 'baz' },
    ]);

    let logs = await doQuery({ show_submission_links: true });
    expect(filter(logs)).toHaveLength(1);
    expect(filter(logs)[0].link).toEqual('foo');

    logs = await doQuery({ show_comment_links: true });
    expect(filter(logs)).toHaveLength(1);
    expect(filter(logs)[0].link).toEqual('bar');

    logs = await doQuery({ show_submission_links: false, show_comment_links: false });
    expect(filter(logs)).toHaveLength(0);
  });

  it('content', async () => {
    const filter = createFilter('content');
    await collection.insertMany([
      { isSubmission: true, content: 'foo' },
      { isComment: true, content: 'bar' },
      { content: 'baz' },
    ]);

    let logs = await doQuery({ show_submission_contents: true });
    expect(filter(logs)).toHaveLength(1);
    expect(filter(logs)[0].content).toEqual('foo');

    logs = await doQuery({ show_comment_contents: true });
    expect(filter(logs)).toHaveLength(1);
    expect(filter(logs)[0].content).toEqual('bar');

    logs = await doQuery({ show_submission_contents: false, show_comment_contents: false });
    expect(filter(logs)).toHaveLength(0);
  });

  it('author', async () => {
    const filter = createFilter('author');
    await collection.insertMany([
      { isSubmission: true, author: 'foo' },
      { isComment: true, author: 'bar' },
    ]);

    let logs = await doQuery({ show_submission_author: true });
    expect(filter(logs)).toHaveLength(1);
    expect(filter(logs)[0].author).toEqual('foo');

    logs = await doQuery({ show_comment_author: true });
    expect(filter(logs)).toHaveLength(1);
    expect(filter(logs)[0].author).toEqual('bar');

    logs = await doQuery({ show_submission_author: false, show_comment_author: false });
    expect(filter(logs)).toHaveLength(0);
  });

  it('title', async () => {
    await collection.insert({ isSubmission: true, title: 'foo' });

    let logs = await doQuery({ show_submission_title: true });
    expect(logs[0].title).toEqual('foo');

    logs = await doQuery({ show_submission_title: false });
    expect(logs[0].title).toBeNull();
  });

  it('mod', async () => {
    await collection.insert({ mod: 'foo' });

    let logs = await doQuery({ show_moderator_name: true });
    expect(logs[0].mod).toEqual('foo');

    logs = await doQuery({ show_moderator_name: false });
    expect(logs[0].mod).toBeNull();
  });

  it('ban user', async () => {
    await collection.insertMany([
      { action: 'banuser', author: 'foo' },
      { action: 'unbanuser', author: 'bar' },
    ]);

    let logs = await doQuery({ show_ban_user: true });
    expect(logs[0].author).toEqual('foo');
    expect(logs[1].author).toEqual('bar');

    logs = await doQuery({ show_ban_user: false });
    expect(logs[0].author).toBeNull();
    expect(logs[1].author).toBeNull();
  });

  it('ban duration', async () => {
    // there's no duration for an unbanuser, so we only need to test banuser here
    await collection.insert({ action: 'banuser', details: '2 days' });

    let logs = await doQuery({ show_ban_duration: true });
    expect(logs[0].details).toEqual('2 days');

    logs = await doQuery({ show_ban_duration: false });
    expect(logs[0].details).toBeNull();
  });

  it('ban description', async () => {
    await collection.insertMany([
      { action: 'banuser', description: 'bot' },
      { action: 'unbanuser', description: 'was temporary' },
    ]);

    let logs = await doQuery({ show_ban_description: true });
    expect(logs[0].description).toEqual('bot');
    expect(logs[1].description).toEqual('was temporary');

    logs = await doQuery({ show_ban_description: false });
    expect(logs[0].description).toBeNull();
    expect(logs[1].description).toBeNull();
  });

  it('automod action reasons', async () => {
    await collection.insert({
      action: 'removelink',
      mod: 'AutoModerator',
      details: 'Auto-remove text posts with no body',
    });

    let logs = await doQuery({ show_automod_action_reasons: true });
    expect(logs[0].automodActionReason).toEqual('Auto-remove text posts with no body');

    logs = await doQuery({ show_automod_action_reasons: false });
    expect(logs[0].automodActionReason).toBeNull();
  });
});
