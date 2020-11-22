import { getMySubredditsCollection } from '../../../models/subreddit';
import { getSubreddit } from './[subreddit]';

describe('/api/subreddits/:subreddit', () => {
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

  it('does not return the modlog configs for the subreddit', async () => {
    const subreddit = await getSubreddit('foo');
    expect(subreddit).not.toHaveProperty('modlogConfig');
  });

  it('does not return the list of moderators', async () => {
    const subreddit = await getSubreddit('foo');
    expect(subreddit).not.toHaveProperty('modlogConfig');
  });
});
