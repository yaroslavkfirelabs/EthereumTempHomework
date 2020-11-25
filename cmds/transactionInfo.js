const w3utils = require('web3-utils');
const {
  setup,
  builder
} = require('./common');
const getClient = require('../utils/client');
const MultisigWallet = require('../build/contracts/MultisigWallet');
const {
  findLogType
} = require('../utils/utility');

async function main(argv) {
  const context = setup(argv);

  const {
    address
  } = require(`../results.${context.environment}.json`);
  await getTransactionInfo(address, argv.transactionId, context);
};

async function getTransactionInfo(contractAddress, transactionId, {
  web3,
  callerKeys,
  config
}) {
  const client = getClient(web3, callerKeys, config);
  const info = await client.call(MultisigWallet, contractAddress, 'getTransactionById', [transactionId]);
  console.log(`\n[Multisig] Transaction info for id ${transactionId}`);
  console.log(`\n[Multisig] Receiver: ${info.receiver}`);
  console.log(`\n[Multisig] Value: ${info.value}`);
  console.log(`\n[Multisig] Bytecode: ${info.data}`);
  console.log(`\n[Multisig] Is executed: ${info.executed}`);
}

exports.handler = main;
exports.command = 'transactioninfo [options]';
exports.describe = 'Get transaction info';
exports.builder = {
  ...builder,
  transactionId: {
    demandOption: true,
    type: 'string',
  },
};