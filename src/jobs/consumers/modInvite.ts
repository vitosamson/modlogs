import { inspect } from 'util';
import reddit from '../../reddit';
import getLogger from '../../logger';
import { JobData } from '../producers/messages';

const logger = getLogger('ModInviteConsumer');

export default async function processModInvite({ subreddit }: JobData) {
  logger.info(`Processing mod invite from ${subreddit}`);

  try {
    // @ts-ignore https://github.com/not-an-aardvark/snoowrap/issues/221
    await reddit.acceptModeratorInvite(subreddit);
    logger.info(`Successfully accepted moderator invite from ${subreddit}`);
  } catch (err) {
    logger.error(`Error accepting moderator invite from ${subreddit}`);
    logger.error(inspect(err));
  }
}
