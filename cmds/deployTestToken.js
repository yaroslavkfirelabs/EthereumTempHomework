const w3utils = require('web3-utils');
const {
  setup,
  builder
} = require('./common');
const getClient = require('../utils/client');
const TestToken = require('../build/contracts/TestToken');


async function main(argv) {
  const context = setup(argv);

  await deployTestToken(argv.initialSupply, context);
};

async function deployTestToken(initialSupply, {web3, callerKeys, config}) {
  console.log(`\n[Test token] deploying Multisig wallet.`);
  console.log(`\n[Test token] initial supply: ${initialSupply} ether`);
  const client = getClient(web3, callerKeys, config);
  const token = await client.deployContract(TestToken, [w3utils.toWei(initialSupply, 'ether')]);
  console.log(`\n[Test token] Deployed to address: ${token.options.address}.`);
}


exports.handler = main;
exports.command = 'deploytesttoken [options]';
exports.describe = 'deploys Test ERC 20 token';
exports.builder = {
  ...builder,
  initialSupply: {
    demandOption: false,
    type: 'string',
    default: '1000',
  }
};