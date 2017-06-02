FROM node:7.10.0-alpine

ENV NODE_ENV=production
EXPOSE 80

# make sure changes to package.json invalidate the docker cache
ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock

RUN cd /tmp && yarn install
RUN mkdir /app && cp -a /tmp/node_modules /app

COPY . /app
WORKDIR /app
RUN rm -rf build
RUN yarn run clean
RUN yarn server:build
RUN yarn ui:build

ENTRYPOINT ["yarn", "server:run"]
