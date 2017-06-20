FROM node:7.10.0-alpine

EXPOSE 80

# pass this via `docker build --build-arg ANALYTICS_KEY=UI-...`
ARG ANALYTICS_KEY

# make sure changes to package.json invalidate the docker cache
ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock

RUN cd /tmp && yarn install --silent
RUN mkdir /app && cp -a /tmp/node_modules /app

COPY . /app
WORKDIR /app

RUN rm -rf build
RUN yarn run clean
RUN yarn server:build
RUN yarn ui:build

# this has to come after we run `yarn install`, otherwise the server will fail to build because it can't find
# certain dev dependencies such as jest - since the server tsconfig.json includes `"**/*.ts"`, that matches
# the *.spec.ts files which require jest, even though they're not needed to run the server itself
ENV NODE_ENV=production

ENTRYPOINT ["yarn", "server:run"]
