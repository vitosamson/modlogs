import { resolve } from 'path';
import * as express from 'express';
import * as expressWinston from 'express-winston';
import * as compress from 'compression';
import * as cookies from 'cookie-parser';

import getLogger from './logger';
import { connectDb, DBNames } from './db';
import renderUi from './routeHandlers/ui';
import subreddits from './routeHandlers/api/subreddits';
import logs from './routeHandlers/api/logs';
import log from './routeHandlers/api/log';
import info from './routeHandlers/info';
import modLoginMiddleware from './routeHandlers/modLoginMiddleware';

const logger = getLogger('server');
const app = express();
const apiRouter = express.Router();
const port = process.env.PORT || 4245;

apiRouter.get('/subreddits', subreddits);
apiRouter.get('/r/:subreddit/logs', modLoginMiddleware, logs);
apiRouter.get('/r/:subreddit/logs/:redditLogId', modLoginMiddleware, log);

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    msg(req, res) {
      const responseTime = (res as any).responseTime;
      const referer = req.get('referer');
      const ua = req.get('user-agent');

      return `${req.method} ${req.url} ${responseTime}ms ${
        res.statusCode
      } [referer: ${referer || 'unknown'}] [UA: ${ua || 'unknown'}]`;
    },
  })
);

app.use(compress());
app.use(cookies());
app.use('/assets', express.static(resolve('build/assets')));
app.get('/favicon.ico', (req, res) => res.status(200).send());
app.use('/api', apiRouter);
app.get('/info', info);
app.get('/r/:subreddit*', modLoginMiddleware, renderUi);
app.get('*', modLoginMiddleware, renderUi);

app.use(
  expressWinston.errorLogger({
    winstonInstance: logger,
  })
);

(async () => {
  try {
    await connectDb(DBNames.logs);
    await connectDb(DBNames.internal);
    app.listen(port, () => {
      logger.info(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
