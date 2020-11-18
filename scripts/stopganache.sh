#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Kill process on port 8545
kill -9 $(lsof -ti tcp:8545)