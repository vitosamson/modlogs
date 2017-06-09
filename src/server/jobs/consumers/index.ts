/**
 * this should be run as a worker process so it's continuously processing jobs
 */

import { addJobProcessor } from '../queue';
import { fetchLogs, processLogs, processLogsJobType } from './modlogs';
import { fetchSubreddits } from './subreddits';
import processReports from './reports';
import processModInvite from './modInvite';
import { jobType as fetchLogsJobType } from '../producers/modlogs';
import { subjects as messageSubjects } from '../producers/messages';
import { jobType as fetchSubredditsJobType } from '../producers/subreddits';
import getLogger from '../../logger';

const logger = getLogger('QueueListener');

logger.info('adding queue processor for', fetchLogsJobType);
addJobProcessor({
  jobType: fetchLogsJobType,
  concurrency: 5,
  processor: fetchLogs,
});

logger.info('adding queue processor for', processLogsJobType);
addJobProcessor({
  jobType: processLogsJobType,
  concurrency: 10,
  processor: processLogs,
});

logger.info('adding queue processor for', messageSubjects.report);
addJobProcessor({
  jobType: messageSubjects.report,
  concurrency: 2,
  processor: processReports,
});

logger.info('adding queue processor for', messageSubjects.modInvite);
addJobProcessor({
  jobType: messageSubjects.modInvite,
  concurrency: 10,
  processor: processModInvite,
});

logger.info('adding queue processor for', fetchSubredditsJobType);
addJobProcessor({
  jobType: fetchSubredditsJobType,
  concurrency: 1,
  processor: fetchSubreddits,
});
