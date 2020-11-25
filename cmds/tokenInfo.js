const w3utils = require('web3-utils');
const {
  setup,
  builder
} = require('./common');
const getClient = require('../utils/client');
const TestToken = require('../build/contracts/TestToken');

async function main(argv) {
  const context = setup(argv);
  const address = argv.address || context.callerKeys.public;

  await getTransactionInfo(argv.tokenAddress, address, context);
};

async function getTransactionInfo(contractAddress, address, {
  web3,
  callerKeys,
  config
}) {
  const client = getClient(web3, callerKeys, config);
  const info = await client.call(TestToken, contractAddress, 'balanceOf', [address]);
  console.log(`\n[Test token] Token amount of ${address} ${info}`);
}

exports.handler = main;
exports.command = 'tokeninfo [options]';
exports.describe = 'Get amount of tokens owned';
exports.builder = {
  ...builder,
  tokenAddress: {
    demandOption: true,
    type: 'string',
  },
  address: {
    demandOption: false,
    type: 'string',
  }
};