#!/bin/bash
printenv | sed 's/^\([a-zA-Z0-9_]*\)=\(.*\)$/export \1="\2"/g' > /etc/environment
# service cron start

/usr/local/bin/node /app/build/server/jobs/consumers
