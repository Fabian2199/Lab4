#!/bin/bash

echo Running server...;docker run -p $1:$1 --env PORT=$1 -d clock-instance;

exit
