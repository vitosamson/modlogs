FROM node:8-alpine

RUN apk add --no-cache \
  vim \
  rsyslog \
  bash \
  curl \
  python3 \
  mongodb-tools

RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

# setup aws-cli for db backups to glacier
WORKDIR /tmp
ENV PATH="/root/.local/bin:$PATH"
RUN pip3 install awscli --upgrade --user

ADD docker/worker/crontab /tmp/crontab
RUN crontab /tmp/crontab && rm /tmp/crontab

RUN mkdir /var/log/jobs
RUN touch \
  /var/log/jobs/subreddits \
  /var/log/jobs/modlogs \
  /var/log/jobs/messages \
  /var/log/jobs/backup \
  /var/log/cron

ENV SHELL /bin/bash
ENV EDITOR /usr/bin/vim

ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn install --silent
RUN mkdir /app && cp -a /tmp/node_modules /app

COPY . /app
WORKDIR /app
RUN rm -rf build
RUN yarn server:build

ADD docker/worker/entrypoint.sh /root/entrypoint.sh
ENTRYPOINT ["/bin/bash", "/root/entrypoint.sh"]
