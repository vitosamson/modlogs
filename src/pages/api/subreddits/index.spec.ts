import { getMySubredditsCollection } from '../../../models/subreddit';
import { getSubreddits } from './index';

describe('/api/subreddits', () => {
  beforeAll(async () => {
    const collection = await getMySubredditsCollection();
    await collection.insertOne({
      name: 'foo',
      modlogConfig: { show_comment_links: false },
      moderators: ['user'],
    });
  });

  afterAll(async () => {
    await (await getMySubredditsCollection()).deleteMany({});
  });

  it('does not return the modlog configs for the subreddits', async () => {
    const subreddits = await getSubreddits();
    subreddits.forEach(sub => {
      expect(sub).not.toHaveProperty('modlogConfig');
    });
  });

  it('does not return the list of moderators', async () => {
    const subreddits = await getSubreddits();
    subreddits.forEach(sub => {
      expect(sub).not.toHaveProperty('modlogConfig');
    });
  });
});
