import { getMySubredditsCollection } from '../../../models/subreddit';
import { subreddits as subredditsApi } from '../subreddits';

describe('/api/subreddits', () => {
  beforeAll(async () => {
    const collection = await getMySubredditsCollection();
    await collection.insert({
      name: 'foo',
      modlogConfig: { show_comment_links: false },
      moderators: ['user'],
    });
  });

  afterAll(async () => {
    await (await getMySubredditsCollection()).remove({});
  });

  it('does not return the modlog configs for the subreddits', async () => {
    const subreddits = await subredditsApi();
    expect(subreddits[0].modlogConfig).toBeUndefined();
  });

  it('does not return the list of moderators', async () => {
    const subreddits = await subredditsApi();
    expect(subreddits[0].moderators).toBeUndefined();
  });
});
