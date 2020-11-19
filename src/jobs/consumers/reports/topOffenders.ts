import getLogger from '../../../logger';
import reddit from '../../../reddit';
import generateTopOffendersReport from '../../../reports/topOffenders';
import { createMarkdownTable } from '../../../utils/markdown';

export interface TopOffendersRequestParams {
  limit?: string;
  period?: string;
}

interface TopOffendersReportJobData {
  request: TopOffendersRequestParams;
  subreddit: string;
  messageFullname: string;
}

const logger = getLogger('ReportsQueueConsumer');
const headerRow = [
  'User',
  'Removed comments',
  'Removed submissions',
  'Total removed',
];
const defaultLimit = 10;

export default async function processTopOffendersReport({
  request,
  subreddit,
  messageFullname,
}: TopOffendersReportJobData) {
  const report = await generateTopOffendersReport({
    subreddit,
    limit: request.limit ? parseInt(request.limit, 10) : defaultLimit,
    period: request.period,
  });

  const table = createMarkdownTable(
    headerRow,
    report.offenders.map(offender => [
      offender.username,
      offender.removedComments,
      offender.removedSubmissions,
      offender.totalRemoved,
    ])
  );

  const message = `Hello,

Here is the Top Offenders report you requested. These are the top ${report.limit} users with the most removed comments and submissions in the past ${report.parsedPeriod}.

${table}`;

  await reddit.sendMessage({
    to: `/r/${subreddit}`,
    subject: 'Top offenders report',
    content: message,
  });

  logger.info(`Finished processing top offenders report for ${subreddit}`);
}
