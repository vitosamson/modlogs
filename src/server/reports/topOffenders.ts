import reddit from '../reddit';
import { getSubredditLogsCollection } from '../models/log';
import { parsePeriod } from '../utils';
import getLogger from '../logger';

interface TopOffendersReportParams {
  subreddit: string;
  period?: string;
  limit?: number;
}

interface Offender {
  username: string;
  removedComments: number;
  removedSubmissions: number;
  totalRemoved: number;
}

interface TopOffendersReport {
  offenders: Offender[];
  parsedPeriod: string;
  limit: number;
}

const MAX_LIMIT = 100;
// const MAX_PERIOD = '1 month';
const logger = getLogger('TopOffendersReportGenerator');

export default async function topOffendersReport({
  subreddit,
  period,
  limit = null,
}: TopOffendersReportParams): Promise<TopOffendersReport> {
  limit = limit ? Math.min(limit, MAX_LIMIT) : MAX_LIMIT;
  const { periodTimestamp, humanizedPeriod } = parsePeriod(period);
  const collection = await getSubredditLogsCollection(subreddit);
  const moderators = await reddit.getSubredditModerators(subreddit);

  const start = Date.now();
  logger.info('generating top offenders report');
  logger.info(
    `subreddit: ${subreddit}, period: ${humanizedPeriod} (${periodTimestamp}), limit: ${limit}`
  );

  const match = {
    author: {
      $nin: moderators
        .map(mod => mod.name)
        .concat(['[deleted]', 'AutoModerator']),
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
        $cond: [
          {
            $eq: ['$action', 'removecomment'],
          },
          1,
          0,
        ],
      },
    },
    removedSubmissions: {
      $sum: {
        $cond: [
          {
            $eq: ['$action', 'removelink'],
          },
          1,
          0,
        ],
      },
    },
  };

  const projection = {
    username: '$_id',
    _id: 0,
    removedComments: 1,
    removedSubmissions: 1,
    totalRemoved: {
      $sum: ['$removedComments', '$removedSubmissions'],
    },
  };

  const logs = await collection
    .aggregate<Offender>([
      {
        $match: match,
      },
      {
        $group: group,
      },
      {
        $project: projection,
      },
      {
        $sort: {
          totalRemoved: -1,
        },
      },
      {
        $limit: limit,
      },
    ])
    .toArray();

  const end = Date.now();
  logger.info(
    `finished generating top offenders report for ${subreddit} in ${
      end - start
    }ms`
  );

  return {
    offenders: logs,
    parsedPeriod: humanizedPeriod,
    limit,
  };
}
