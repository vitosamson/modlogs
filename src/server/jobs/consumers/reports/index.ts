import reddit from '../../../reddit';
import getLogger from '../../../logger';
import topOffendersReport, { TopOffendersRequestParams } from './topOffenders';
import userReport, { UserReportRequestParams } from './user';
import { Metric, MetricType } from '../../../models/metric';

const logger = getLogger('ReportsQueueConsumer');

type RequestParams = {
  type: string;
} & TopOffendersRequestParams &
  UserReportRequestParams;

interface ReportJobData {
  request: RequestParams;
  subreddit: string;
  messageFullname: string;
}

export default async function processReport(data: ReportJobData) {
  const type = (data.request.type || '').trim().toLowerCase();
  logger.info(
    `processing ${type} report for ${data.subreddit} (message ${data.messageFullname})`
  );
  const metric = new Metric(MetricType.report, data);

  // TODO: send a message back if there was an error or unknown report type?

  switch (type) {
    case 'top offenders':
      await topOffendersReport(data);
      metric.report();
    case 'user':
      await userReport(data);
      metric.report();
    default:
      logger.info(`unknown report type ${type}`);
      await reddit.markMessagesRead([data.messageFullname]);
      logger.info(`marked message ${data.messageFullname} as read`);
  }
}
