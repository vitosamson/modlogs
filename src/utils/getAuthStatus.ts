import type { IncomingMessage } from 'http';
import { inspect } from 'util';
import { getCookieParser } from 'next/dist/next-server/server/api-utils';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import getLogger from '../logger';
import { getSubreddit } from '../models/subreddit';

interface JWT {
  accessToken: string;
  refreshToken: string;
  profile: {
    username: string;
    provider: string;
  };
  iat: number;
}

export interface AuthResponse {
  username: string | null;
  isAuthenticatedMod: boolean;
}

const logger = getLogger('server:getAuthStatus');

if (!process.env.LW_JWT_SECRET) {
  logger.error('Must provide the LW_JWT_SECRET variable.');
  process.exit(1);
}

export async function getAuthStatus(
  req: IncomingMessage,
  subredditName?: string
): Promise<AuthResponse> {
  // This needs to be inside this function since the unit test sets the env var dynamically
  const jwtSecret = process.env.LW_JWT_SECRET as string;

  try {
    /**
     * req.cookies isn't available in getServerSideProps, so use this workaround:
     * https://github.com/vercel/next.js/issues/11126
     */
    const cookies = getCookieParser(req)();
    const decodedJwt = jwt.verify(cookies.jwt, jwtSecret) as JWT;
    const { username } = decodedJwt.profile;

    if (!username) {
      return {
        username: null,
        isAuthenticatedMod: false,
      };
    }

    if (!subredditName) {
      return {
        username,
        isAuthenticatedMod: false,
      };
    }

    const subreddit = await getSubreddit(subredditName);
    const isAuthenticatedMod = !!subreddit?.moderators?.find(
      m => m.toLowerCase() === username.toLowerCase()
    );

    return {
      username,
      isAuthenticatedMod,
    };
  } catch (err) {
    // Not interested in errors relating to invalid tokens
    if (!(err instanceof JsonWebTokenError)) {
      logger.error(inspect(err));
    }

    return {
      username: null,
      isAuthenticatedMod: false,
    };
  }
}
