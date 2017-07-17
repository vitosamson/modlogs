import reddit from '../../../reddit';
import getLogger from '../../../logger';
import { parseUsername } from '../../../reddit';
import userReport from '../../../reports/user';
import { createMarkdownTable } from '../../../utils';

export interface UserReportRequestParams {
  username: string;
  period?: string;
}

interface UserReportJobData {
  request: UserReportRequestParams;
  subreddit: string;
  messageFullname: string;
}

const logger = getLogger('ReportsQueueConsumer');

export default async function processUserReport({ request, subreddit, messageFullname }: UserReportJobData) {
  const username = parseUsername(request.username);

  if (!username) {
    logger.info('no username provided for user report in message %s, aborting', messageFullname);
    return;
  }

  const report = await userReport({ username, subreddit, period: request.period });

  const commentsTable = createMarkdownTable(
    ['Comment', 'Date'],
    report.removedComments.sort((a, b) =>
      b.timestamp - a.timestamp
    ).map(comment => ([
      `[${truncateContent(comment.title)}](${comment.link})`,
      new Date(comment.timestamp).toLocaleDateString(),
    ]))
  );

  const submissionsTable = createMarkdownTable(
    ['Submission', 'Date'],
    report.removedSubmissions.sort((a, b) =>
      b.timestamp - a.timestamp
    ).map(submission => ([
      `[${truncateContent(submission.title)}](${submission.link})`,
      new Date(submission.timestamp).toLocaleDateString(),
    ]))
  );

  const message = `Hello,

Here is the User Report you requested for /u/${username} in the past ${request.period}.

### Comments
**Total submitted:** ${report.totalCommentCount}${'  '}
**Total removed:** ${report.removedCommentCount}${'  '}
**% Removed:** ${report.commentRatio}%

${commentsTable}

### Submissions

**Total submitted:** ${report.totalSubmissionCount}${'  '}
**Total removed:** ${report.removedSubmissionCount}${'  '}
**% Removed:** ${report.submissionRatio}%

${submissionsTable}
`;

  await reddit.sendMessage({
    to: `/r/${subreddit}`,
    subject: `User report for /u/${username}`,
    content: message,
  });
}

function truncateContent(content: string, length = 60) {
  if (typeof content !== 'string') return '';

  let truncated = content.slice(0, length).replace(/\n/g, ' ');

  if (truncated.length < content.length) {
    truncated += '...';
  }

  return truncated;
}
