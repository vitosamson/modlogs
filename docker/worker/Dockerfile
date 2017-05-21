FROM node:7.10.0-alpine

# RUN apt-get update && apt-get install -y cron vim-tiny rsyslog bash
RUN apk add --no-cache vim rsyslog bash
ADD docker/worker/crontab /etc/cron.d/jobs
RUN mkdir /var/log/jobs
RUN touch /var/log/jobs/subreddits /var/log/jobs/modlogs /var/log/jobs/messages

ENV SHELL /bin/bash
ENV EDITOR /usr/bin/vim

ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn install
RUN mkdir /app && mv /tmp/node_modules /app

COPY . /app
WORKDIR /app
RUN rm -rf build
RUN yarn server:build

ADD docker/worker/entrypoint.sh /root/entrypoint.sh
ENTRYPOINT ["/bin/bash", "/root/entrypoint.sh"]
