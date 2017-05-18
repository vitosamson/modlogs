/**
 * responsible for adding jobs to the modlog queue.
 * each subreddit that we're a moderator in will have a job created in order to pull that sub's modlogs
 * and then add them to the db.
 */

import { inspect } from 'util';
import { addJob, getQueuedJobsByType } from '../queue';
import reddit from '../../reddit';
import getLogger from '../../logger';

const logger = getLogger('ModlogQueueProducer');
export const jobType = 'fetchLogs';

export interface FetchModlogsJobData {
  subreddit: string;
}

export const run = async () => {
  logger.info('fetching modlogs');

  const mySubreddits = (await reddit.getModdedSubreddits()).map(sub => sub.name);
  const queuedJobs = await getQueuedJobsByType(jobType);

  try {
    await Promise.all(mySubreddits.map(subredditName => {
      // avoid adding duplicate jobs
      if (queuedJobs.some(job => job.data.subreddit === subredditName)) {
        logger.info('duplicate %s job for %s', jobType, subredditName);
      }

      logger.info('adding %s job for %s', jobType, subredditName);

      return addJob<FetchModlogsJobData>({
        jobType,
        data: {
          subreddit: subredditName,
        },
      });
    }));
  } catch (err) {
    logger.error('error adding %s job', jobType);
    logger.error(inspect(err));
  } finally {
    process.exit();
  }
};
