#!/bin/bash
# Usage: ./run-dev.sh up -d
# or     ./run-dev.sh up -d <list of services>
#        ./run-dev.sh down

DATA_DIR=/tmp/modlogs

mkdir -p $DATA_DIR
mkdir -p $DATA_DIR/mongo/data
mkdir -p $DATA_DIR/mongo/data/db
mkdir -p $DATA_DIR/mongo/data/configdb
mkdir -p $DATA_DIR/redis

docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml $@
