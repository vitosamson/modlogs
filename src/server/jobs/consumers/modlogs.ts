import { ModAction } from 'snoowrap';
// import { addJob } from '../queue';
import reddit, { isComment, isSubmission } from '../../reddit';
import getLogger from '../../logger';
import { FetchModlogsJobData } from '../producers/modlogs';
import { ILog, getSubredditLogsCollection } from '../../models/log';
import { ID_DESCENDING } from '../../db';

const logger = getLogger('ModlogsConsumer');
export const processLogsJobType = 'processLogs';

interface ProcessLogsJobData {
  subreddit: string;
  logs: ModAction[];
}

export async function fetchLogs({ subreddit }: FetchModlogsJobData) {
  const collection = await getSubredditLogsCollection(subreddit);
  const last: ILog = (await collection.find().sort({ _id: ID_DESCENDING }).limit(1).toArray())[0];
  const before = (last && last.redditId) || undefined;

  logger.info('fetching logs for', subreddit);

  if (before) {
    logger.info(
      '\t last log is _id: %s, redditId: %s, date: %s',
      last._id,
      last.redditId,
      new Date(last.timestamp).toLocaleDateString()
    );
  } else {
    logger.info('\t no previous logs, starting from the top (this might take a while)');
  }

  const logs = await reddit.getSubredditModLogs(subreddit, { before });

  logger.info('got %s logs for %s', logs.length, subreddit);

  await processLogs({
    subreddit,
    logs: logs.reverse(),
  });

  // await addJob<ProcessLogsJobData>({
  //   jobType: processLogsJobType,
  //   data: {
  //     subreddit,

  //     // logs have to be reversed so that when they're added to the db,
  //     // the newest log is at the end of the collection
  //     logs: logs.reverse(),
  //   },
  // });
}

export async function processLogs({ subreddit, logs }: ProcessLogsJobData) {
  const collection = await getSubredditLogsCollection(subreddit);

  while (logs.length) {
    logger.info('processing logs for %s, %s remaining', subreddit, logs.length);
    const group = logs.splice(0, 1000); // limit of collection.insertMany()
    await collection.insertMany(formatLogs(group));
  }

  logger.info('finished processing logs for', subreddit);
}

const formatLogs = (logs: ModAction[]): ILog[] => {
  return logs.map(log => {
    const { submissionId, commentId } = reddit.getThingIdsFromLink(log.target_permalink);
    const subreddit = log.subreddit.toString();

    return {
      timestamp: log.created_utc * 1000,
      subreddit,
      mod: log.mod,
      action: log.action,
      redditId: log.id,
      link: log.target_permalink,
      content: log.target_body,
      title: log.target_title,
      author: log.target_author,
      fullname: log.target_fullname,
      details: log.details,
      description: log.description,
      isComment: isComment(log.target_fullname),
      isSubmission: isSubmission(log.target_fullname),
      commentId,
      submissionId,
    };
  });
};
