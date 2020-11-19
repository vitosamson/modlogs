import { NextApiHandler } from 'next';
import { getAuthStatus } from '../../utils/getAuthStatus';

const authHandler: NextApiHandler = async (req, res) => {
  const auth = await getAuthStatus(req, req.query.subreddit as string);
  res.json(auth);
};

export default authHandler;
