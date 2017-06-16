import { Collection } from 'mongodb';
import { createMongoQueryFromConfig, createMongoProjectionFromConfig } from '../db';
import { getSubredditLogsCollection } from '../models/log';

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
  const doQuery = (c: any) => collection.aggregate([{ $project: createMongoProjectionFromConfig(c) }]).toArray();
  const createFilter = (by: string) => (logs: any[]) => logs.filter(l => !!l[by]);
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

    logs = await doQuery({ show_submission_links: false, show_comment_lins: false });
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

    logs = await doQuery({ show_submission_contents: false, show_comment_conents: false });
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

    logs = await doQuery({ show_submission_author: false, show_comment_autor: false });
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
});
