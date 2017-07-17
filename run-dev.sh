#!/bin/bash

DATA_DIR=/tmp/modlogs

mkdir $DATA_DIR

mkdir -p $DATA_DIR/mongo/data
mkdir $DATA_DIR/mongo/data/db
mkdir $DATA_DIR/mongo/data/configdb

mkdir $DATA_DIR/redis

docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up $@
