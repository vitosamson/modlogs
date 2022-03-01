import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { getSubreddit } from '../models/subreddit';
import getLogger from '../logger';

interface JWT {
  accessToken: string;
  refreshToken: string;
  profile: {
    username: string;
    provider: string;
  };
  iat: number;
}

export interface AuthenticatedRequest extends Request {
  __user: string;
  __isAuthenticatedMod?: boolean;
}

const logger = getLogger('server');

export default async function modLoginMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const decodedJwt = jwt.verify(
      req.cookies.jwt,
      process.env.LW_JWT_SECRET
    ) as JWT;
    const { username } = decodedJwt.profile;
    logger.debug(`username: ${username}, subreddit: ${req.params.subreddit}`);

    if (username) {
      req.__user = username;
    } else {
      return next();
    }

    const subreddit = await getSubreddit(req.params.subreddit);
    req.__isAuthenticatedMod = !!subreddit.moderators.find(
      m => m.toLowerCase() === username.toLowerCase()
    );
  } catch (e) {
    req.__user = null;
    req.__isAuthenticatedMod = false;
  } finally {
    next();
  }
}
