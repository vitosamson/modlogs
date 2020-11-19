interface ThingIds {
  submissionId: string | null;
  commentId: string | null;
  subreddit: string | null;
}

const thingIdRegExp = /\/r\/(\w+)\/?(?:comments)?\/?(\w+)?\/?(?:\w+)?\/?(\w+)?/;
export function getThingIdsFromLink(link: string): ThingIds {
  const noResults: ThingIds = {
    submissionId: null,
    commentId: null,
    subreddit: null,
  };
  if (typeof link !== 'string') return noResults;
  const match = link.match(thingIdRegExp);
  if (!match || !match.length) return noResults;

  return {
    subreddit: match[1],
    submissionId: match[2] || null,
    commentId: match[3] || null,
  };
}

// Extract a username from /u/username or u/username
export const parseUsername = (username: string): string => {
  const match: string[] = /(?:u\/)?(\w+)/.exec(username) || [];
  return match[1] || username;
};
