/**
 * fetches the inbox messages and adds them to the appropriate queue.
 * currently the only queue is reports.
 */

import { inspect } from 'util';
import * as yaml from 'js-yaml';
import reddit from '../../reddit';
import getLogger from '../../logger';
import { addJob, getQueuedJobsByType } from '../queue';
import { flushPendingMetrics } from '../../models/metric';
import { getMySubreddits } from '../../models/subreddit';

const logger = getLogger('MessagesQueueProducer');

interface Subjects {
  [key: string]: string;
}

export const subjects: Subjects = {
  report: 'report',
  modInvite: 'modInvite',
};

export interface JobData {
  request?: any; // TODO: report param interface
  messageId: string;
  messageFullname: string;
  timestamp: number;
  from: string;
  subreddit: string;
}

export async function run() {
  logger.info('fetching messages');

  try {
    const mySubreddits = (await getMySubreddits()).map(sub => sub.name);
    const messages = await reddit.getInboxMessages();

    logger.info(`got ${messages.length} messages`);

    await Promise.all(
      messages.map(async message => {
        const subject = (message.subject || '').trim().toLowerCase();
        const queuedReportJobs = await getQueuedJobsByType(subjects[subject]);

        if (
          message.distinguished !== 'moderator' || // ignore message that aren't from subreddit modmail
          !message.subreddit ||
          queuedReportJobs.some(job => job.data.messageId === message.id) // don't add dupe jobs
        ) {
          logger.info(`ignoring message ${message.name}`);
          await reddit.markMessagesRead([message]);
        }

        let jobType;
        const subreddit = message.subreddit.display_name;
        const jobData: JobData = {
          messageId: message.id,
          messageFullname: message.name,
          timestamp: message.created * 1000,
          subreddit,

          // message.author will be null in moderator invites, so we can't access it until we know
          // what type of message we received. this should only be set for `report` type messages.
          from: '',
        };

        if (/invitation to moderate/.test(subject)) {
          jobType = subjects.modInvite;
        } else if (subject === 'report') {
          jobData.from = message.author.name;

          if (!mySubreddits.includes(message.subreddit.display_name)) {
            logger.info(
              `ignoring report request ${message.name}, not a sub we moderate`
            );
            await reddit.markMessagesRead([message]);
            return;
          }

          jobType = subjects.report;

          try {
            const body = yaml.safeLoad(message.body);
            if (!body || typeof body !== 'object') return;
            jobData.request = body;
          } catch (err) {
            logger.error(
              `could not parse message body for message ${message.name}`
            );
            await reddit.markMessagesRead([message]);
            return;
          }
        } else {
          logger.info(`ignoring message ${message.name}, unknown subject`);
          await reddit.markMessagesRead([message]);
          return;
        }

        try {
          await addJob<JobData>({
            jobType,
            data: jobData,
          });

          logger.info(`added ${jobType} for ${subreddit}`);
        } catch (err) {
          logger.error(
            `error adding ${jobType} job for message ${message.name}`
          );
          logger.error(inspect(err));
          return;
        } finally {
          await reddit.markMessagesRead([message]);
          logger.info(`marked message ${message.name} as read`);
        }
      })
    );
  } catch (err) {
    logger.error('error processing messages');
    logger.error(inspect(err));
  } finally {
    await flushPendingMetrics();
    process.exit();
  }
}
