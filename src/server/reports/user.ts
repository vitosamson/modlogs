import { Comment, Submission, VoteableContent } from 'snoowrap';
import reddit from '../reddit';
import { getSubredditLogsCollection, ILog } from '../models/log';
import { parsePeriod } from '../utils';
import getLogger from '../logger';

interface UserReportParams {
  username: string;
  subreddit: string;
  period?: string;
}

interface UserReport {
  removedComments: ILog[];
  removedCommentCount: number;
  totalCommentCount: number;
  commentRatio: number;
  removedSubmissions: ILog[];
  removedSubmissionCount: number;
  totalSubmissionCount: number;
  submissionRatio: number;
  parsedPeriod: string;
}

interface AggregatedResult {
  _id: string;
  count: number;
  logs: ILog[];
}

interface AggregateGroup {
  _id: string;
  count: {
    $sum: number;
  };
  logs: {
    $addToSet: {
      [key in keyof ILog]?: string;
    };
  };
}

const logger = getLogger('UserReportGenerator');

export const parseUsername = (username: string): string => {
  const match: string[] = /(?:u\/)?(\w+)/.exec(username) || [];
  return match[1] || username;
};

export default async function userReport({ username, period, subreddit }: UserReportParams): Promise<UserReport> {
  const logsCollection = await getSubredditLogsCollection(subreddit);
  username = parseUsername(username);

  const authorRegex = new RegExp(username, 'i');
  const { periodTimestamp, humanizedPeriod } = parsePeriod(period || '1 month');

  logger.info('running user report');
  logger.info('subreddit: %s, user: %s, period: %s (%s)', subreddit, username, humanizedPeriod, periodTimestamp);

  const match = {
    author: authorRegex,
    action: {
      $in: ['removecomment', 'removelink'],
    },
    timestamp: {
      $gte: periodTimestamp,
    },
  };

  const group: AggregateGroup = {
    _id: '$action',
    count: {
      $sum: 1,
    },
    logs: {
      $addToSet: {
        link: '$link',
        title: '$title',
        timestamp: '$timestamp',
        content: '$content',
        author: '$author',
        subreddit: '$subreddit',
      },
    },
  };

  const logs = await logsCollection.aggregate<AggregatedResult>([{
    $match: match,
  }, {
    $sort: {
      timestamp: -1,
    },
  }, {
    $group: group,
  }]).toArray();

  const removedCommentsResult = logs.find(c => c._id === 'removecomment');
  const removedCommentCount = removedCommentsResult ? removedCommentsResult.count : 0;
  const removedComments = (removedCommentsResult && removedCommentsResult.logs) || [];

  const removedSubmissionResults = logs.find(c => c._id === 'removelink');
  const removedSubmissionCount = removedSubmissionResults ? removedSubmissionResults.count : 0;
  const removedSubmissions = (removedSubmissionResults && removedSubmissionResults.logs) || [];

  const totalCommentCount = await getTotalsForUser(username, subreddit, 'comments', periodTimestamp);
  const commentRatio = totalCommentCount > 0 ? Math.round((removedCommentCount / totalCommentCount) * 100) : 0;

  const totalSubmissionCount = await getTotalsForUser(username, subreddit, 'submissions', periodTimestamp);
  const submissionRatio = totalSubmissionCount > 0 ? Math.round((removedSubmissionCount / totalSubmissionCount) * 100) : 0;

  return {
    removedComments,
    removedCommentCount,
    totalCommentCount,
    commentRatio,
    removedSubmissions,
    removedSubmissionCount,
    totalSubmissionCount,
    submissionRatio,
    parsedPeriod: humanizedPeriod,
  };
}

async function getTotalsForUser(
  username: string,
  subreddit: string,
  type: 'comments' | 'submissions',
  earliestTimestamp: number
): Promise<number> {
  let items: Array<VoteableContent<Comment | Submission>>;

  switch (type) {
    case 'comments':
      items = await reddit.getUserComments(username);
      break;
    case 'submissions':
      items = await reddit.getUserSubmissions(username);
      break;
    default: return 0;
  }

  const filteredItemsBySubreddit = items.filter(item => item.subreddit.display_name.toLowerCase() === subreddit.toLowerCase());
  const filteredItemsByTimestamp = filteredItemsBySubreddit.filter(item => item.created * 1000 >= earliestTimestamp);

  return filteredItemsByTimestamp.length;
}
