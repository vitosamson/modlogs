import { inspect } from 'util';
import reddit from '../../reddit';
import { createMongoQueryFromConfig, createMongoProjectionFromConfig, ID_ASCENDING, ID_DESCENDING } from '../../db';
import { getSubredditConfig } from '../../models/subreddit';
import getLogger from '../../logger';
import { getSubredditLogsCollection, ILog } from '../../models/log';

const logger = getLogger('modlogs');

export interface ILogsQuery {
  limit?: number | string;
  after?: string;
  before?: string;
  filter?: string;
  actions?: string;
  type?: 'comments' | 'submissions';
}

export interface ILogsRetVal {
  logs: ILog[];
  after: string | null;
  before: string | null;
}

export const noLogs: ILogsRetVal = {
  logs: [],
  after: null,
  before: null,
};

export default async function logs(subredditName: string, query: ILogsQuery): Promise<ILogsRetVal> {
  const config = await getSubredditConfig(subredditName);
  const collection = await getSubredditLogsCollection(subredditName);
  const limit = Math.min((typeof query.limit === 'string' ? parseInt(query.limit, 10) : query.limit || 25), 100);
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

  if (query.filter) {
    const { submissionId, commentId } = reddit.getThingIdsFromLink(query.filter);
    if (commentId && config.show_comment_links) {
      mongoQuery.commentId = commentId;
    } else if (submissionId && config.show_submission_links) {
      mongoQuery.submissionId = submissionId;
    } else {
      return noLogs;
    }
  }

  if (query.actions) {
    mongoQuery.action = {
      $in: query.actions.split(',').map((action: string) => action.trim()),
    };
  }

  if (query.type) {
    if (query.type === 'submissions') mongoQuery.isSubmission = true;
    else if (query.type === 'comments') mongoQuery.isComment = true;
  }

  logger.debug(inspect(mongoQuery));

  const aggregation = collection.aggregate<ILog>([])
    .match(mongoQuery)
    .sort(sort)
    .limit(limit)
    .project(projection);

  let logs = await aggregation.toArray();
  if (query.before && mongoQuery._id) logs = logs.reverse();

  const first = logs[0];
  const last = logs[logs.length - 1];

  const hasAfter = last && await collection.find(Object.assign({}, mongoQuery, {
    _id: { $lt: last._id },
  })).sort({
    _id: ID_ASCENDING,
  }).limit(limit).hasNext();

  const hasBefore = first && await collection.find(Object.assign({}, mongoQuery, {
    _id: { $gt: first._id },
  })).sort({
    _id: ID_DESCENDING,
  }).limit(limit).hasNext();

  return {
    logs,
    after: hasAfter ? last.redditId : null,
    before: hasBefore ? first.redditId : null,
  };
}
