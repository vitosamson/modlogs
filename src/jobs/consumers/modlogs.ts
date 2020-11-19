import type { ModAction } from 'snoowrap';
import { inspect } from 'util';
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
  logs: ILog[];
}

export async function fetchLogs({ subreddit }: FetchModlogsJobData) {
  const collection = await getSubredditLogsCollection(subreddit);
  const last: ILog = (
    await collection.find().sort({ _id: ID_DESCENDING }).limit(1).toArray()
  )[0];
  const before = (last && last.redditId) || undefined;

  logger.info(`Fetching logs for ${subreddit}`);

  if (before) {
    logger.info(
      `\t Last log is _id: ${last._id}, redditId: ${
        last.redditId
      }, date: ${new Date(last.timestamp).toLocaleDateString()}`
    );
  } else {
    logger.info(
      '\t No previous logs, starting from the top (this might take a while)'
    );
  }

  try {
    const logs = formatLogs(
      await reddit.getSubredditModLogs(subreddit, { before })
    );

    logger.info(`Got ${logs.length} logs for ${subreddit}`);

    return processLogs({
      subreddit,
      logs: logs.reverse(),
    });
  } catch (err) {
    logger.error('Error fetching or processing logs');
    logger.error(inspect(err));
  }

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
    logger.info(`Processing logs for ${subreddit}, ${logs.length} remaining`);
    const group = logs.splice(0, 1000); // limit of collection.insertMany()
    await collection.insertMany(group);
  }

  logger.info(`Finished processing logs for ${subreddit}`);
}

const formatLogs = (logs: ModAction[]): ILog[] => {
  return logs.map(log => {
    const { submissionId, commentId } = reddit.getThingIdsFromLink(
      log.target_permalink
    );
    const subreddit = log.subreddit.display_name;

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
