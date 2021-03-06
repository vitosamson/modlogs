/**
 * Fetches the subreddits that have added us as a moderator.
 * This was originally requested directly from reddit every time the UI was loaded, but reddit's api can be really slow,
 * so we'll just fetch and store the subreddits (and their modlog configs) in our db which is much quicker.
 *
 * This job should be run fairly often, like every minute.
 *
 * This should probably be queued per subreddit, since it can potentially spawn many reddit api requests -
 * the list of modded subreddits (possibly paginated), and the modlog config wiki page for each one.
 * However it's important that this happens quickly and often to provide a fast turnaround for subs editing
 * their modlog config, or adding/removing the modlog user as a moderator.
 */

import { inspect } from 'util';
import getLogger from '../../logger';
import reddit from '../../reddit';
import { getMySubredditsCollection, ISubreddit } from '../../models/subreddit';
import { createSubredditIndexes } from '../../models/log';

const logger = getLogger('SubredditsConsumer');

export async function fetchSubreddits() {
  const subredditsCollection = await getMySubredditsCollection();
  const currentSubreddits = await subredditsCollection
    .find<ISubreddit>()
    .toArray();
  const newSubreddits = await reddit.getModdedSubreddits();

  logger.info(
    `Processing subreddits, got ${newSubreddits.length} from reddit and ${currentSubreddits.length} in db`
  );

  await Promise.all(
    newSubreddits.map(async sub => {
      try {
        const subredditConfig = await reddit.getSubredditConfig(sub.name);
        const moderators = (await reddit.getSubredditModerators(sub.name)).map(
          user => user.name
        );
        const { matchedCount } = await subredditsCollection.updateOne(
          { name: sub.name },
          { ...sub, modlogConfig: subredditConfig, moderators },
          { upsert: true }
        );

        if (matchedCount) {
          logger.info(`Updated subreddit ${sub.name}`);
        } else {
          await createSubredditIndexes(sub.name);
          logger.info(`Added subreddit ${sub.name}`);
        }
      } catch (err) {
        logger.error(`Could not add or update subreddit ${sub.name}`);
        logger.error(inspect(err));
      }
    })
  );

  await Promise.all(
    currentSubreddits.map(async sub => {
      if (!newSubreddits.find(s => s.name === sub.name)) {
        logger.info(`No longer a moderator of ${sub.name}`);

        try {
          await subredditsCollection.remove({ name: sub.name });
        } catch (err) {
          logger.error(`Could not remove subreddit ${sub.name}`);
          logger.error(inspect(err));
        }
      }
    })
  );

  logger.info('Finished processing subreddits');
}
