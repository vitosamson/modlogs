import { inspect } from 'util';
import * as kue from 'kue';
import getLogger from '../logger';

const logger = getLogger('queue');
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  logger.error(`Must provide the REDIS_URL variable.`);
  process.exit(1);
}

const queue = kue.createQueue({
  prefix: 'modlogs',
  redis: REDIS_URL,
});

logger.info(`Connected to queue at ${REDIS_URL}`);

export const addJob = <D>({
  jobType,
  data = {} as D,
}: {
  jobType: string;
  data?: D;
}): Promise<kue.Job> => {
  const job = queue.create(jobType, data).removeOnComplete(true);

  return new Promise<kue.Job>((resolve, reject) => {
    job.save((err?: Error) => {
      if (err) return reject(err);
      resolve(job);
    });
  });
};

type JobProcessor = (data: any) => Promise<any>;
interface AddJobProcessorParams {
  jobType: string;
  concurrency?: number;
  processor: JobProcessor;
}
export const addJobProcessor = <D>({
  jobType,
  concurrency,
  processor,
}: AddJobProcessorParams): void => {
  queue.process(jobType, concurrency, async (job: kue.Job, cb: any) => {
    try {
      await processor(job.data as D);
      cb();
    } catch (err) {
      logger.error(`${jobType} job failure`);
      logger.error(inspect(err));
      cb(err);
    }
  });
};

export const getQueuedJobsByTypeAndState = (
  jobType: string,
  state: string
): Promise<kue.Job[]> => {
  return new Promise<kue.Job[]>(resolve => {
    kue.Job.rangeByType(
      jobType,
      state,
      0,
      100000,
      'asc',
      (err: Error, jobs: kue.Job[]) => {
        resolve(jobs);
      }
    );
  });
};

export const getQueuedJobsByType = (jobType: string): Promise<kue.Job[]> => {
  return new Promise<kue.Job[]>(async resolve => {
    const inactiveJobs = await getQueuedJobsByTypeAndState(jobType, 'inactive');
    const activeJobs = await getQueuedJobsByTypeAndState(jobType, 'active');
    resolve([...inactiveJobs, ...activeJobs]);
  });
};
