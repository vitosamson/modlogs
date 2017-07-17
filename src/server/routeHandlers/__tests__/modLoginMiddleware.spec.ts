import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import modLoginMiddleware, { AuthenticatedRequest } from '../modLoginMiddleware';
import { getMySubredditsCollection } from '../../models/subreddit';

describe('modLoginMiddleware', () => {
  const secret = 'foo';
  const subName = 'mysub';
  const username = 'theuser';
  const jwtCookie = jwt.sign({
    profile: {
      username,
    },
  }, secret);

  beforeAll(async () => {
    process.env.LW_JWT_SECRET = secret;
    const collection = await getMySubredditsCollection();
    await collection.insert({
      name: subName,
      moderators: [username],
    });
  });

  afterAll(async () => {
    (await getMySubredditsCollection()).remove({});
  });

  it('sets req.__user if the user is logged in', done => {
    const req = {
      cookies: { jwt: jwtCookie },
      params: { subreddit: subName },
    } as AuthenticatedRequest;
    modLoginMiddleware(req, ({} as Response), () => {
      expect(req.__user).toEqual('theuser');
      done();
    });
  });

  it('sets req.__isAuthenticatedMod to true if the current user is a moderator of the subreddit', done => {
    const req = {
      cookies: { jwt: jwtCookie },
      params: { subreddit: subName },
    } as AuthenticatedRequest;
    modLoginMiddleware(req, ({} as Response), () => {
      expect(req.__isAuthenticatedMod).toBe(true);
      done();
    });
  });

  it('sets req.__isAuthenticatedMod to false if the user is not a mod', done => {
    const req = {
      cookies: {
        jwt: jwt.sign({
          profile: {
            username: 'someotheruser',
          },
        }, secret),
      },
      params: { subreddit: subName },
    } as AuthenticatedRequest;
    modLoginMiddleware(req, ({} as Response), () => {
      expect(req.__isAuthenticatedMod).toBe(false);
      done();
    });
  });
});
