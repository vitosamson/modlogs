import { NextApiHandler } from 'next';
import { inspect } from 'util';
import { defaultLimit } from '../../../../config';
import {
  createMongoProjectionFromConfig,
  createMongoQueryFromConfig,
  ID_ASCENDING,
  ID_DESCENDING,
} from '../../../../db';
import getLogger from '../../../../logger';
import { getSubredditLogsCollection, ILog } from '../../../../models/log';
import { getSubredditConfig } from '../../../../models/subreddit';
import { getAuthStatus } from '../../../../utils/getAuthStatus';
import { getThingIdsFromLink, parseUsername } from '../../../../utils/reddit';

export interface LogsQuery {
  limit?: number | string;
  after?: string;
  before?: string;
  link?: string;
  actions?: string;
  type?: 'comments' | 'submissions';
  author?: string;
  mod?: string;
}

export interface LogsResponse {
  logs: ILog[];
  after: string | null;
  before: string | null;
  isAuthenticatedMod: boolean;
}

const logger = getLogger('server:logs');
const noLogs = (isAuthenticatedMod: boolean): LogsResponse => ({
  logs: [],
  after: null,
  before: null,
  isAuthenticatedMod,
});

const logsHandler: NextApiHandler = async (req, res) => {
  const subredditName = req.query.subreddit as string;
  const { isAuthenticatedMod } = await getAuthStatus(req, subredditName);

  try {
    res.json(await getLogs(subredditName, req.query, isAuthenticatedMod));
  } catch (err) {
    logger.error(inspect(err));
    res.json(noLogs(isAuthenticatedMod));
  }
};

export default logsHandler;

export async function getLogs(
  subredditName: string,
  query: LogsQuery,
  isAuthenticatedMod: boolean
): Promise<LogsResponse> {
  const config = await getSubredditConfig(subredditName, isAuthenticatedMod);
  const collection = await getSubredditLogsCollection(subredditName);
  const limit = Math.min(
    typeof query.limit === 'string'
      ? parseInt(query.limit, 10)
      : query.limit || defaultLimit,
    100
  );
  const mongoQuery = createMongoQueryFromConfig(config);
  const projection = createMongoProjectionFromConfig(config);
  const sort = {
    _id: ID_DESCENDING,
  };

  if (query.after) {
    const after = await collection.findOne({ redditId: query.after });
    if (after) {
      mongoQuery._id = {
        $lt: after._id,
      };
    }
  } else if (query.before) {
    const before = await collection.findOne({ redditId: query.before });
    if (before) {
      mongoQuery._id = {
        $gt: before._id,
      };
      sort._id = ID_ASCENDING;
    }
  }

  // If the user is an authenticated mod, config.show_comment_links and config.show_submission_links will be true,
  // So no need for an isAuthenticatedMod check here
  if (query.link) {
    const { submissionId, commentId } = getThingIdsFromLink(query.link);
    if (commentId && config.show_comment_links) {
      mongoQuery.commentId = commentId;
    } else if (submissionId && config.show_submission_links) {
      mongoQuery.submissionId = submissionId;
    } else {
      return noLogs(isAuthenticatedMod);
    }
  }

  if (query.actions) {
    mongoQuery.action = {
      $in: query.actions.split(',').map((action: string) => action.trim()),
    };
  }

  if (query.type) {
    if (query.type === 'submissions') {
      mongoQuery.isSubmission = true;
    } else if (query.type === 'comments') {
      mongoQuery.isComment = true;
    }
  }

  // Queries that are only available to authenticated mods for the current subreddit
  if (isAuthenticatedMod) {
    if (query.author) {
      mongoQuery.author = new RegExp(parseUsername(query.author), 'i');
    }

    if (query.mod) {
      mongoQuery.mod = new RegExp(parseUsername(query.mod), 'i');
    }
  }

  logger.debug(inspect(mongoQuery));

  const aggregation = collection
    .aggregate<ILog>([])
    .match(mongoQuery)
    .sort(sort)
    .limit(limit)
    .project(projection);

  let aggregatedLogs = await aggregation.toArray();
  if (query.before && mongoQuery._id) {
    aggregatedLogs = aggregatedLogs.reverse();
  }

  const first = aggregatedLogs[0];
  const last = aggregatedLogs[aggregatedLogs.length - 1];

  const hasAfter =
    last &&
    (await collection
      .find({
        ...mongoQuery,
        _id: { $lt: last._id },
      })
      .sort({
        _id: ID_ASCENDING,
      })
      .limit(limit)
      .hasNext());

  const hasBefore =
    first &&
    (await collection
      .find({
        ...mongoQuery,
        _id: { $gt: first._id },
      })
      .sort({
        _id: ID_DESCENDING,
      })
      .limit(limit)
      .hasNext());

  return {
    logs: aggregatedLogs.map(log => ({
      ...log,
      _id: log._id?.toString(),
    })),
    after: hasAfter ? last.redditId : null,
    before: hasBefore ? first.redditId : null,
    isAuthenticatedMod,
  };
}
