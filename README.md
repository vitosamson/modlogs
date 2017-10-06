# Mod Logs

This is meant as a way for subreddits to provide transparency in their moderation.

If you're a moderator and want to enable Mod Logs for your subreddit, take a look at the [Moderator Instructions](ModeratorInstructions.md) file.

Moderator logs are fetched from the reddit API and stored in a Mongo database. The reddit API only provides logs for the past 120 days and doesn't provide a lot of flexibility in terms of filtering those logs, so we store them ourselves.

## Dependencies

You'll need:

  - Node 7+
  - MongoDB
  - Redis

Run `yarn install` to install the JS dependencies.

Mongo is used to store the moderator logs that we fetch. Redis is used to queue the log fetching and report processing.

## Running the app

### Development

Run `./run-dev`. You can pass any valid `docker-compose up` arguments to that script, e.g. `./run-dev -d nginx`. Make sure the appropriate environment variables are set.

Add the following lines to your hosts file:

```
127.0.0.1 modlogs.local
127.0.0.1 login.modlogs.local
```

Then you'll be able to access the UI at https://modlogs.local:4241. The server will be running in watch-mode, and UI hot reload will work.

### Production

`yarn ui:build` and `yarn server:build` to build, then `<env vars> yarn server:run` to run.

Or just run `docker-compose -f docker/docker-compose.yml up`.

#### Docker

The app is also dockerized for ease of deployment. There are a few docker images:

  - `web`: runs the API server and serves the UI. be sure to provide the correct env vars (see below)
  - `worker`: queues and processes logs, reports, etc. also needs env vars
  - `mongo`: runs the mongo database
  - `login`: a small OAuth microservice from [login-with](https://github.com/lipp/login-with)
  - `nginx`: frontend for the `web` and `login` services
  - `redis`: runs the redis server for the worker queue

Make sure to pass the appropriate environment variables into the docker containers when they're run.

### Environment variables

| variable | default | required by | note |
|---|---|---|---|
| `PORT` | `4245` | `web` | the port that the server will listen on |
| `APP_ID` |  | `worker` | the app ID given by reddit for API access |
| `APP_SECRET` |  | `worker` | the app secret given by reddit for API access |
| `REDDIT_USER` |  | `worker` | the reddit username to authenticate with |
| `REDDIT_PASSWORD` |  | `worker` | the reddit password to authenticate with |
| `USER_AGENT` |  | `worker` | the user agent to send with reddit API calls |
| `MONGODB_URI` | `mongodb://localhost:modlogs` | `web`, `worker` | the URI of your mongo server |
| `REDIS_URL` | `redis://localhost` | `worker` | the URI of your redis server |
| `ANALYTICS_KEY` |  | `web (during ui:build command only)` | the google analytics key |
| `LW_SESSION_SECRET` |  | `login` | https://github.com/lipp/login-with#mandatory-environment-variables |
| `LW_JWT_SECRET` |  | `login` | https://github.com/lipp/login-with#mandatory-environment-variables |
| `LW_REDDIT_CLIENTID` |  | `login` | https://github.com/lipp/login-with#reddit-specific-environment-variables |
| `LW_REDDIT_CLIENTSECRET` |  | `login` | https://github.com/lipp/login-with#reddit-specific-environment-variables |
| `AWS_ACCESS_KEY_ID` |  | `worker` | for AWS glacier backups |
| `AWS_SECRET_ACCESS_KEY` |  | `worker` | for AWS glacier backups |
| `GLACIER_BACKUP_VAULT` |  | `worker` |  |
| `GLACIER_BACKUP_REGION` |  | `worker` |  |
| `NODE_ENV` | `production` | `web` |  |
| `LOG_LEVEL` | `info` | `web`, `worker` |  |
| `ENABLE_METRIC_REPORTING` | `false` | `worker` | if enabled, logs certain metrics (reddit API hits, reports, etc) to an internal mongo db. disabled by default |

## Processing subreddits, logs, and reports

Subreddit, log and report processing are queued. There are two components to this: producers and consumers.

The consumers should be run in a worker process which stays running continuously:

`<env vars> node build/server/queue/consumers`

This will ensure that any new queue items are processed.

The producers should be run periodically. There are currently three producers: one to fetch the list of subreddits, one for the logs and one for PMs which produce moderator reports:

`<env vars> node -e "require('build/server/queue/producers/modlogs').run()"`  
`<env vars> node -e "require('build/server/queue/producers/messages').run()"`  
`<env vars> node -e "require('build/server/queue/producers/subreddits').run()"`

The env vars marked as required by `worker` are needed for both.

## Tests

Tests are run using `jest`.

To run the tests, run `yarn test` for a single run or `yarn test:watch` to run in watch mode. You can also pass additional options to jest by running `yarn test -- --opt1 --opt2 [etc]`.

The tests rely on a running Mongo DB accessible at either `mongodb://localhost:27017` or whatever the environment variable `MONGODB_URI` is set to.
