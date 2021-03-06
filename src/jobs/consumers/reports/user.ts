import moment from 'moment';
import reddit from '../../../reddit';
import getLogger from '../../../logger';
import { parseUsername } from '../../../reddit';
import userReport from '../../../reports/user';
import { createMarkdownTable } from '../../../utils/markdown';

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
const dateFormat = 'YYYY-MM-DD';

export default async function processUserReport({
  request,
  subreddit,
  messageFullname,
}: UserReportJobData) {
  const username = parseUsername(request.username);

  if (!username) {
    logger.info(
      `No username provided for user report in message ${messageFullname}, aborting`
    );
    return;
  }

  const report = await userReport({
    username,
    subreddit,
    period: request.period,
  });

  const commentsTable = createMarkdownTable(
    ['Comment', 'Date'],
    report.removedComments
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(comment => [
        `[${truncateContent(comment.content) || comment.link}](${
          comment.link
        })`,
        moment(comment.timestamp).utc().format(dateFormat),
      ])
  );

  const submissionsTable = createMarkdownTable(
    ['Submission', 'Date'],
    report.removedSubmissions
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(submission => [
        `[${truncateContent(submission.title)}](${submission.link})`,
        moment(submission.timestamp).utc().format(dateFormat),
      ])
  );

  const message = `Hello,

Here is the User Report you requested for /u/${username} in the past ${
    request.period
  }.

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

function truncateContent(content?: string | null, length = 60) {
  if (typeof content !== 'string') return '';

  let truncated = content.slice(0, length).replace(/\n/g, ' ');

  if (truncated.length < content.length) {
    truncated += '...';
  }

  return truncated;
}
