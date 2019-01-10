#!/usr/bin/env bash
#
# Postinstall script for setting up development environment
#
# @package: HoloREA
# @author:  pospi <pospi@spadgos.com>
# @since:   2018-12-28
#
##

command -v docker >/dev/null 2>&1 || {
    printf "\e[1m\e[31mCould not locate Docker! You should install this...\n">&2;
}

command -v docker-compose >/dev/null 2>&1 || {
    printf "\e[1m\e[31mCould not locate docker-compose! You should install this...\n">&2;
}

echo "Ensure base Docker container for HC development node..."
docker pull holochain/holochain-proto:develop
