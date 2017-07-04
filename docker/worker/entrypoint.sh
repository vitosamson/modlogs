#!/bin/bash

# export the env vars passed to the docker container so they're available to the cron scripts
printenv | sed 's/^\([a-zA-Z0-9_]*\)=\(.*\)$/export \1="\2"/g' > /etc/environment

# start cron
crond -b -l8 -L /var/log/cron

# start the queue consumer
/usr/local/bin/node /app/build/server/jobs/consumers
