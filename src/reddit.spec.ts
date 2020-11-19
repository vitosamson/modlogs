import {
  isComment,
  isSubmission,
  getThingIdsFromLink,
  parseUsername,
} from './reddit';

describe('reddit', () => {
  it('isComment', () => {
    expect(isComment('t1_a9cd3')).toBeTruthy();
    expect(isComment('foo')).toBeFalsy();
    expect(isComment('t3_abc8209')).toBeFalsy();
  });

  it('isSubmission', () => {
    expect(isSubmission('t3_ac92cd')).toBeTruthy();
    expect(isSubmission('t1_scmc0q')).toBeFalsy();
    expect(isSubmission('foo')).toBeFalsy();
  });

  it('getThingIdsFromLink', () => {
    expect(
      getThingIdsFromLink('https://reddit.com/r/foo/comments/abc/bar/123')
    ).toEqual({
      submissionId: 'abc',
      commentId: '123',
      subreddit: 'foo',
    });

    expect(getThingIdsFromLink('/r/foo/comments/abc/bar/123')).toEqual({
      submissionId: 'abc',
      commentId: '123',
      subreddit: 'foo',
    });

    expect(getThingIdsFromLink('/r/foo/comments/abc')).toEqual({
      submissionId: 'abc',
      commentId: null,
      subreddit: 'foo',
    });

    expect(getThingIdsFromLink('/r/foo')).toEqual({
      subreddit: 'foo',
      submissionId: null,
      commentId: null,
    });

    expect(getThingIdsFromLink(null as any)).toEqual({
      subreddit: null,
      submissionId: null,
      commentId: null,
    });
  });

  it('parseUsername', () => {
    expect(parseUsername('foo')).toEqual('foo');
    expect(parseUsername('/u/foo')).toEqual('foo');
    expect(parseUsername('u/foo')).toEqual('foo');
  });
});
