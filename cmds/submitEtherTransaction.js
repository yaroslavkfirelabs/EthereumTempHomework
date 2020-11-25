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
  const {
    to,
    amount,
    currencyType
  } = argv;
  await submitTransaction(address, to, amount, currencyType, context);
};

async function submitTransaction(contractAddress, to, amount, currencyType, {
  web3,
  callerKeys,
  config
}) {
  const value = w3utils.toWei(amount, currencyType);
  console.log(`\n[Multisig] Submitting ether wallet transaction`);
  console.log(`\n[Multisig] To: ${to}`);
  console.log(`\n[Multisig] Amount: ${amount} ${currencyType}`);
  const client = getClient(web3, callerKeys, config);
  const tx = await client.sendTransaction(MultisigWallet, contractAddress,
    'submitTransaction', [to, value, '0x0'], value);
  console.log(`\n[Multisig] Transaction send: ${tx.transactionHash}`);
  const event = findLogType(tx, MultisigWallet.abi, 'Submitted');
  console.log(`\n[Multisig] Transaction id: ${event.transactionId}`);
}

exports.handler = main;
exports.command = 'submitethertransaction [options]';
exports.describe = 'Submit ether transaction to Multisig Wallet';
exports.builder = {
  ...builder,
  to: {
    demandOption: true,
    type: 'string',
  },
  amount: {
    demandOption: true,
    type: 'string',
  },
  currencyType: {
    demandOption: false,
    type: 'string',
    default: 'ether'
  }
};