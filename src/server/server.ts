import { resolve } from 'path';
import { inspect } from 'util';
import * as express from 'express';
import * as expressWinston from 'express-winston';
import * as compress from 'compression';

import getLogger from './logger';
import { connectDb } from './db';
import renderUi from './routeHandlers/ui';
import subreddits from './routeHandlers/api/subreddits';
import logs, { noLogs } from './routeHandlers/api/logs';
import log from './routeHandlers/api/log';
import info from './routeHandlers/info';

const logger = getLogger('server');
const app = express();
const apiRouter = express.Router();
const port = process.env.PORT || 4245;

apiRouter.get('/subreddits', async (req, res) => {
  try {
    res.json(await subreddits());
  } catch (err) {
    logger.error(inspect(err));
    res.json([]);
  }
});

apiRouter.get('/r/:subreddit/logs', async (req, res) => {
  try {
    res.json(await logs(req.params.subreddit, req.query));
  } catch (err) {
    logger.error(inspect(err));
    res.json(noLogs);
  }
});

apiRouter.get('/r/:subreddit/logs/:redditLogId', async (req, res) => {
  try {
    res.json(await log(req.params.subreddit, req.params.redditLogId));
  } catch (err) {
    logger.error(inspect(err));
    res.status(404).send(err.message);
  }
});

app.use(expressWinston.logger({
  winstonInstance: logger,
  msg: '{{req.method}} {{req.url}} {{res.responseTime}}ms {{res.statusCode}}',
}));

app.use(compress());
app.use('/assets', express.static(resolve('build/assets')));
app.get('/favicon.ico', (req, res) => res.status(200).send());
app.use('/api', apiRouter);
app.get('/info', async (req, res) => {
  try {
    res.json(await info());
  } catch (err) {
    logger.error(inspect(err));
    res.status(500).send();
  }
});
app.use(renderUi);

app.use(expressWinston.errorLogger({
  winstonInstance: logger,
}));

connectDb().then(() => {
  app.listen(port, () => {
    logger.info(`listening at http://localhost:${port}`);
  });
});
