import { Comment, Submission } from 'snoowrap';
import reddit from '../../../reddit';
import { getSubredditLogsCollection } from '../../../models/log';
import getLogger from '../../../logger';
import { createMarkdownTable, parsePeriod } from '../../../utils';

const logger = getLogger('ReportsQueueConsumer');
const parseUsername = (username: string): string => {
  const match: string[] = /(?:u\/)?(\w+)/.exec(username) || [];
  return match[1] || username;
};

export interface UserReportRequestParams {
  username: string;
  period?: string;
}

interface UserReportJobData {
  request: UserReportRequestParams;
  subreddit: string;
  messageFullname: string;
}

interface AggregatedLink {
  link: string;
  title: string;
  timestamp: number;
  content: string;
}

interface AggregatedResult {
  _id: string;
  count: number;
  links: AggregatedLink[];
}

export default async function processUserReport({ request, subreddit, messageFullname }: UserReportJobData) {
  const collection = await getSubredditLogsCollection(subreddit);
  const username = parseUsername(request.username);

  // TODO: send a message back that username is required?
  if (!username) {
    return;
  }

  const authorRegexp = new RegExp(username, 'i');
  const { periodTimestamp, humanizedPeriod } = parsePeriod(request.period || '1 month', '3 months');

  logger.info('running user report');
  logger.info('subreddit: %s, user: %s, period: %s %s', subreddit, username, periodTimestamp, humanizedPeriod);

  const match = {
    author: authorRegexp,
    action: {
      $in: ['removecomment', 'removelink'],
    },
    timestamp: {
      $gte: periodTimestamp,
    },
  };

  const group = {
    _id: '$action',
    count: {
      $sum: 1,
    },
    links: {
      $addToSet: {
        link: '$link',
        title: '$title',
        timestamp: '$timestamp',
        content: '$content',
      },
    },
  };

  const counts = await collection.aggregate<AggregatedResult>([{
    $match: match,
  }, {
    $sort: {
      timestamp: -1,
    },
  }, {
    $group: group,
  }]).toArray();

  let message;

  if (!counts.length) {
    message = `Could not find any logs for /u/${username}`;
  } else {
    const removedComments = counts.find(c => c._id === 'removecomment') || { count: 0, links: [] as AggregatedLink[] };
    const removedSubmissions = counts.find(c => c._id === 'removelink') || { count: 0, links: [] as AggregatedLink[] };
    const totalComments = await getTotalsForUser(username, subreddit, 'comments', periodTimestamp);
    const totalSubmissions = await getTotalsForUser(username, subreddit, 'submissions', periodTimestamp);
    const commentPercentage = totalComments > 0 ? Math.round((removedComments.count / totalComments) * 100) : 0;
    const submissionPercentage = totalSubmissions > 0 ? Math.round((removedSubmissions.count / totalSubmissions) * 100) : 0;

    const commentsTable = createMarkdownTable(
      ['Comment', 'Date'],
      removedComments.links.sort((a, b) =>
        b.timestamp - a.timestamp,
      ).map(link => ([
        `[${truncateContent(link.content)}](${link.link})`,
        new Date(link.timestamp).toLocaleDateString(),
      ])),
    );

    const submissionsTable = createMarkdownTable(
      ['Submission', 'Date'],
      removedSubmissions.links.sort((a, b) =>
        b.timestamp - a.timestamp,
      ).map(link => ([
        `[${truncateContent(link.title)}](${link.link})`,
        new Date(link.timestamp).toLocaleDateString(),
      ])),
    );

    message = `Hello,

Here is the User Report you requested for /u/${username} in the past ${humanizedPeriod}.

### Comments

**Total submitted:** ${totalComments}${'  '}
**Total removed:** ${removedComments.count}${'  '}
**% Removed:** ${commentPercentage}%

${commentsTable}

### Submissions

**Total submitted:** ${totalSubmissions}${'  '}
**Total removed:** ${removedSubmissions.count}${'  '}
**% Removed:** ${submissionPercentage}%

${submissionsTable}`;
  }

  await reddit.sendMessage({
    to: `/r/${subreddit}`,
    subject: `User report for /u/${username}`,
    content: message,
  });

  logger.info('finished processing user report for %s in %s', username, subreddit);
}

async function getTotalsForUser(username: string, subreddit: string, type: 'comments' | 'submissions', earliestTimestamp: number): Promise<number> {
  let items;

  switch (type) {
    case 'comments':
      items = await reddit.getUserComments(username) as Comment[];
      break;
    case 'submissions':
      items = await reddit.getUserSubmissions(username) as Submission[];
      break;
    default: return 0;
  }

  const subItems = items.filter(item => item.subreddit.display_name.toLowerCase() === subreddit.toLowerCase());
  const timedSubItems = subItems.filter(item => item.created * 1000 >= earliestTimestamp);

  return timedSubItems.length;
}

function truncateContent(content: string, length = 60) {
  if (typeof content !== 'string') return '';

  let truncated = content.slice(0, length).replace(/\n/g, ' ');

  if (truncated.length < content.length) {
    truncated += '...';
  }

  return truncated;
}
