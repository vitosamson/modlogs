// TODO: fix these tests

// import { getSubredditLogsCollection } from '../../../models/log';
// import { getMySubredditsCollection, ISubredditModlogConfig } from '../../../models/subreddit';
// import { log as logApi } from '../log';

// describe('/api/log', () => {
//   const subreddit = 'logApiTest';
//   const logId = 'abc123';
//   const updateConfig = async (config: ISubredditModlogConfig) => (
//     (await getMySubredditsCollection()).updateOne(
//       { name: subreddit },
//       { name: subreddit, modlogConfig: config },
//       { upsert: true }
//     )
//   );

//   beforeAll(async () => {
//     const logsCollection = await getSubredditLogsCollection(subreddit);
//     await logsCollection.insert({
//       redditId: logId,
//       content: 'ajsdfjakdsfljkadsfj',
//       mod: 'somemod',
//       action: 'removecomment',
//       isComment: true,
//       link: 'http://link',
//       author: 'someuser',
//       subreddit,
//     });

//     const subredditsCollection = await getMySubredditsCollection();
//     await subredditsCollection.insertOne({ name: subreddit });
//   });

//   afterAll(async () => {
//     await (await getSubredditLogsCollection(subreddit)).remove({});
//     await (await getMySubredditsCollection()).remove({});
//   });

//   it('returns the log', async () => {
//     const log = await logApi(subreddit, logId);
//     expect(log.redditId).toEqual(logId);
//   });

//   it('throws if it cannot find the log', async () => {
//     try {
//       await logApi(subreddit, 'foo');
//       throw new Error();
//     } catch (e) {
//       expect(e).toBeInstanceOf(Error);
//     }
//   });

//   it('respects the subreddit config when trying to find the log', async () => {
//     await updateConfig({ exclude_moderators: ['somemod'] });

//     try {
//       const log = await logApi(subreddit, logId);
//       expect(log).not.toBeDefined();
//     } catch (e) {
//       expect(e.toString()).toMatch(/Could not find that log/);
//     }

//     await updateConfig({ exclude_actions: ['removecomment'] });

//     try {
//       const log = await logApi(subreddit, logId);
//       expect(log).not.toBeDefined();
//     } catch (e) {
//       expect(e.toString()).toMatch(/Could not find that log/);
//     }
//   });

//   it('respects the subreddit config when filtering the log fields', async () => {
//     await updateConfig({ show_moderator_name: true, show_comment_author: true, show_comment_links: true });

//     let log = await logApi(subreddit, logId);
//     expect(log).toMatchObject({ mod: 'somemod', link: 'http://link', author: 'someuser' });

//     await updateConfig({ show_moderator_name: false, show_comment_author: false, show_comment_links: false });

//     log = await logApi(subreddit, logId);
//     expect(log.mod).toBeNull();
//     expect(log.link).toBeNull();
//     expect(log.author).toBeNull();
//   });
// });
