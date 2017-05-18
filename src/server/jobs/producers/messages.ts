/**
 * fetches the inbox messages and adds them to the appropriate queue.
 * currently the only queue is reports.
 */

import { inspect } from 'util';
import * as yaml from 'js-yaml';
import reddit from '../../reddit';
import getLogger from '../../logger';
import { addJob, getQueuedJobsByType } from '../queue';

const logger = getLogger('MessagesQueueProducer');

interface Subjects {
  [key: string]: string;
}

export const subjects: Subjects = {
  report: 'report',
};

interface JobData {
  request: any; // TODO: report param interface
  messageId: string;
  messageFullname: string;
  timestamp: number;
  from: string;
  subreddit: string;
}

export async function run() {
  logger.info('fetching messages');

  const mySubreddits = (await reddit.getModdedSubreddits()).map(sub => sub.name);
  const messages = await reddit.getInboxMessages();

  logger.info('got %s messages', messages.length);

  try {
    await Promise.all(messages.map(async message => {
      const subject = (message.subject || '').trim().toLowerCase();
      const queuedReportJobs = await getQueuedJobsByType(subjects[subject]);

      if (
        message.distinguished !== 'moderator' || // ignore message that aren't from subreddit modmail
        !message.subreddit ||
        !mySubreddits.includes(message.subreddit.display_name) ||
        queuedReportJobs.some(job => job.data.messageId === message.id) // don't add dupe jobs
      ) {
        await reddit.markMessagesRead([message]);
        logger.info('ignoring message', message.name);
      }

      const subreddit = message.subreddit.display_name;

      switch (subject) {
        case subjects.report:
          try {
            const body = yaml.safeLoad(message.body); // TODO: cast this to report param interface
            if (!body || typeof body !== 'object') return;

            await addJob<JobData>({
              jobType: subject,
              data: {
                request: body,
                messageId: message.id,
                messageFullname: message.name,
                timestamp: message.created * 1000,
                from: message.author,
                subreddit,
              },
            });

            logger.info('added %s %s for %s', body.type, subject, subreddit);
          } catch (err) {
            logger.error('error adding %s job for message %s', subject, message.name);
            logger.error(inspect(err));
          } finally {
            await reddit.markMessagesRead([message]);
            logger.info('marked message %s as read', message.name);
          }
          break;
        default:
          await reddit.markMessagesRead([message]);
          logger.info('ignoring message', message.name);
      }
    }));
  } catch (err) {
    logger.error('error processing messages');
    logger.error(inspect(err));
  } finally {
    process.exit();
  }
}
