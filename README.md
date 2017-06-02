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

There's a few steps to running in development: the webpack dev server for client code bundling/watching/hot reload; building the server in watch mode; and running the server in watch mode.

First, run the ui dev server: `yarn ui:dev`.

Then, build the server in watch mode: `yarn server:build:watch`.

Then, run the server in watch mode: `<env vars> yarn server:run:watch`. See the environment variables section below.

Once that's all up and running, you'll be able to access the UI at http://localhost:4241, and the API at http://localhost:4245.

### Production

`yarn ui:build` and `yarn server:build` to build, then `<env vars> yarn server:run` to run.

#### Docker

The app is also dockerized for ease of deployment. There are three docker images:

  - `web`: runs the API server and serves the UI. be sure to provide the correct env vars (see below)
  - `worker`: queues and processes logs, reports, etc. also needs env vars
  - `mongo`: runs the mongo database

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
| `NODE_ENV` | `production` | `web` |  |
| `LOG_LEVEL` | `info` |  | `web`, `worker` |  |

## Processing subreddits, logs, and reports

### Subreddits

The list of subreddits that the modlogs user moderates, and their modlog configs, get stored in mongo as well. This is to avoid excessive reddit API calls because they're limited and slow.

This is done via `<env vars> node build/server/jobs/subreddits` and should be run fairly often. This job is not queued and will run immediately.

The env vars marked as required by `worker` are needed for this.

### Logs and reports

Log and report processing are queued. There are two components to this: producers and consumers.

The consumers should be run in a worker process which stays running continuously:

`<env vars> node build/server/queue/consumers`

This will ensure that any new queue items are processed.

The producers should be run periodically. There are currently two producers: one for the logs and one for PMs which produce moderator reports:

`<env vars> node build/server/queue/producers/modlogs`  
`<env vars> node build/server/queue/producers/messages`

The env vars marked as required by `worker` are needed for both.
