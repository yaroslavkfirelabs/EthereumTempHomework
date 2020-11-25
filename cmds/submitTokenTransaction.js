const w3utils = require('web3-utils');
const {
  setup,
  builder
} = require('./common');
const getClient = require('../utils/client');
const MultisigWallet = require('../build/contracts/MultisigWallet');
const TestToken = require('../build/contracts/TestToken');
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
    currencyType,
    tokenAddress
  } = argv;
  await submitTransaction(address, to, amount, currencyType, tokenAddress, context);
};

async function submitTransaction(contractAddress, to, amount, currencyType, tokenAddress, {
  web3,
  callerKeys,
  config
}) {
  const value = w3utils.toWei(amount, currencyType);
  const client = getClient(web3, callerKeys, config);
  console.log(`\n[Multisig] Submitting tokens to a contract`);
  console.log(`\n[Multisig] Amount: ${amount} ${currencyType}`);
  const sendTx = await client.sendTransaction(TestToken, tokenAddress, 
    'transfer', [contractAddress, value]);
  console.log(`\n[Multisig] Transaction send: ${sendTx.transactionHash}`);

  const token = new web3.eth.Contract(TestToken.abi);
  const bytecode = token.methods.transfer(to, value).encodeABI();
  console.log(`\n[Multisig] Submitting tokens wallet transaction`);
  console.log(`\n[Multisig] To: ${to}`);
  console.log(`\n[Multisig] Amount: ${amount} ${currencyType}`);
  console.log(`\n[Multisig] Bytecode: ${bytecode}`);
  const submitTx = await client.sendTransaction(MultisigWallet, contractAddress, 
    'submitTransaction', [tokenAddress, 0, bytecode]);
  console.log(`\n[Multisig] Transaction send: ${submitTx.transactionHash}`);
  const event = findLogType(submitTx, MultisigWallet.abi, 'Submitted');
  console.log(`\n[Multisig] Transaction id: ${event.transactionId}`);
}

exports.handler = main;
exports.command = 'submittokentransaction [options]';
exports.describe = 'Submit token transaction to Multisig Wallet';
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
  },
  tokenAddress: {
    demandOption: true,
    type: 'string',
  }
};