import getLogger from '../../logger';
import { addJob, getQueuedJobsByType } from '../queue';

const logger = getLogger('SubredditsQueueProducer');
export const jobType = 'fetchSubreddits';

export async function run() {
  logger.info('Queueing subreddit fetch');

  const queuedJobs = await getQueuedJobsByType(jobType);

  if (queuedJobs.length > 0) {
    logger.info('Duplicate job, aborting');
    process.exit();
  }

  await addJob({ jobType });
  process.exit();
}
