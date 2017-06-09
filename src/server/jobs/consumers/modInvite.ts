import { inspect } from 'util';
import reddit from '../../reddit';
import getLogger from '../../logger';
import { JobData } from '../producers/messages';

const logger = getLogger('ModInviteConsumer');

export default async function processModInvite({ subreddit }: JobData) {
  logger.info('processing mod invite from', subreddit);

  try {
    await reddit.acceptModeratorInvite(subreddit);
    logger.info('successfully accepted moderator invite from', subreddit);
  } catch (err) {
    logger.error('error accepting moderator invite from', subreddit);
    logger.error(inspect(err));
  }
}
