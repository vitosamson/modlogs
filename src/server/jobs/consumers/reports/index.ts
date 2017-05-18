import reddit from '../../../reddit';
import getLogger from '../../../logger';
import topOffendersReport, { TopOffendersRequestParams } from './topOffenders';
import userReport, { UserReportRequestParams } from './user';

const logger = getLogger('ReportsQueueConsumer');

type RequestParams = {
  type: string;
} & TopOffendersRequestParams & UserReportRequestParams;

interface ReportJobData {
  request: RequestParams;
  subreddit: string;
  messageFullname: string;
}

export default async function processReport(data: ReportJobData) {
  const type = (data.request.type || '').trim().toLowerCase();
  logger.info('processing %s report for %s (message %s)', type, data.subreddit, data.messageFullname);

  // TODO: send a message back if there was an error or unknown report type?

  switch (type) {
    case 'top offenders':
      return topOffendersReport(data);
    case 'user':
      return userReport(data);
    default:
      logger.info('unknown report type', type);
      await reddit.markMessagesRead([data.messageFullname]);
      logger.info('marked message %s as read', data.messageFullname);
  }
}
