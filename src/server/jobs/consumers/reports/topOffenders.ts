import reddit from '../../../reddit';
import { getSubredditLogsCollection } from '../../../models/log';
import getLogger from '../../../logger';
import { createMarkdownTable, parsePeriod } from '../../../utils';

const logger = getLogger('ReportsQueueConsumer');
const headerRows = ['User', 'Removed comments', 'Removed submissions', 'Total removed'];

export interface TopOffendersRequestParams {
  limit?: string;
  period?: string;
}

interface TopOffendersReportJobData {
  request: TopOffendersRequestParams;
  subreddit: string;
  messageFullname: string;
}

export default async function topOffendersReport({ request, subreddit, messageFullname }: TopOffendersReportJobData) {
  const limit = Math.min(parseInt(request.limit, 10) || 5, 100);
  const { periodTimestamp, humanizedPeriod } = parsePeriod(request.period || '1 month');
  const collection = await getSubredditLogsCollection(subreddit);
  const moderators = await reddit.getSubredditModerators(subreddit);

  logger.info('running top offenders report');
  logger.info('subreddit: %s, period: %s %s', subreddit, periodTimestamp, humanizedPeriod);

  const match = {
    author: {
      $nin: moderators.map(mod => mod.name).concat(['[deleted]', 'Automoderator']),
    },
    action: {
      $in: ['removecomment', 'removelink'],
    },
    timestamp: {
      $gte: periodTimestamp,
    },
  };

  const group = {
    _id: '$author',
    removedComments: {
      $sum: {
        $cond: [{
          $eq: ['$action', 'removecomment'],
        }, 1, 0],
      },
    },
    removedSubmissions: {
      $sum: {
        $cond: [{
          $eq: ['$action', 'removelink'],
        }, 1, 0],
      },
    },
  };

  const project = {
    user: '$_id',
    _id: 0,
    removedComments: 1,
    removedSubmissions: 1,
    totalRemoved: {
      $sum: ['$removedComments', '$removedSubmissions'],
    },
  };

  const problemUsers = await collection.aggregate([{
    $match: match,
  }, {
    $group: group,
  }, {
    $project: project,
  }, {
    $sort: {
      totalRemoved: -1,
    },
  }, {
    $limit: limit,
  }]).toArray();

  const table = createMarkdownTable(headerRows, problemUsers.map(user => (
    [user.user, user.removedComments, user.removedSubmissions, user.totalRemoved]
  )));

  const message = `Hello,

Here is the Top Offenders report you requested. These are the top ${limit} users with the most removed comments and submissions in the past ${humanizedPeriod}.

${table}`;

  await reddit.sendMessage({
    to: `/r/${subreddit}`,
    subject: 'Top offenders report',
    content: message,
  });

  logger.info('finished processing top offenders report for %s', subreddit);
}
