#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
# trap cleanup EXIT

cleanup() {
  # Kill the testrpc instance that we started (if we started one and if it's still running).
  if [ -n "$testrpc_pid" ] && ps -p $testrpc_pid > /dev/null; then
    kill -9 $testrpc_pid
  fi
}

testrpc_port=8545

testrpc_running() {
  nc -z localhost "$testrpc_port"
}

start_testrpc() {
  # We define 10 accounts with balance 1M ether, needed for high-value tests.
  local accounts=(
    --account="0xe2c85576dfbc49c1f3d24bed05c97d17205e9896f0388603ab1fb9683236f122,1000000000000000000000000000000"
    --account="0xbcf8f3b618e6d3afa643d7f15b16b0f6ab2c2357c5988db46a740258e501bcc5,1000000000000000000000000000000"
    --account="0x2602894615564171f0e068c8a52921bed612dcc5486c22a37ce73e123468edd6,1000000000000000000000000000000"
    --account="0x787cb841728bb0c8934d81b5fa37a3c199382c155fa96a4b2d12809122f098f3,1000000000000000000000000000000"
    --account="0x58956b6640f87d731837d05d2d03302034899374a766253f7ec11ad38f1fb152,1000000000000000000000000000000"
  )

  touch ganache.log
  node_modules/.bin/ganache-cli --gasLimit 0xfffffffffff --port "$testrpc_port" "${accounts[@]}" > ganache.log &
  testrpc_pid=$!
}

if testrpc_running; then
  echo "Using existing testrpc instance"
else
  echo "Starting our own testrpc instance"
  start_testrpc
fi