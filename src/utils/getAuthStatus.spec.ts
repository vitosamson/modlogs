import * as jwt from 'jsonwebtoken';
import { getAuthStatus } from './getAuthStatus';
import { getMySubredditsCollection } from '../models/subreddit';
import { IncomingMessage } from 'http';

describe('getAuthStatus', () => {
  const secret = 'foo';
  const subName = 'mysub';
  const username = 'theuser';
  const jwtCookie = jwt.sign(
    {
      profile: {
        username,
      },
    },
    secret
  );

  beforeAll(async () => {
    process.env.LW_JWT_SECRET = secret;
    const collection = await getMySubredditsCollection();
    await collection.insertOne({
      name: subName,
      moderators: [username],
    });
  });

  afterAll(async () => {
    (await getMySubredditsCollection()).remove({});
  });

  it('provides the username if the user is logged in', async () => {
    const req = {
      headers: {
        cookie: `jwt=${jwtCookie}`,
      },
    } as IncomingMessage;
    const auth = await getAuthStatus(req, subName);
    expect(auth.username).toEqual(username);
  });

  it('indicates whether the user is a moderator of the subreddit', async () => {
    let req = {
      headers: {
        cookie: `jwt=${jwtCookie}`,
      },
    } as IncomingMessage;
    let auth = await getAuthStatus(req, subName);
    expect(auth.isAuthenticatedMod).toBe(true);

    auth = await getAuthStatus(req, 'someothersub');
    expect(auth.isAuthenticatedMod).toBe(false);

    req = {
      headers: {
        cookie: `jwt=${jwt.sign(
          {
            profile: {
              username: 'someotheruser',
            },
          },
          secret
        )}`,
      },
    } as IncomingMessage;
    auth = await getAuthStatus(req, subName);
    expect(auth.isAuthenticatedMod).toBe(false);
  });
});
