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
    transactionId
  } = argv;
  await confirmTransaction(address, transactionId, context);
};

async function confirmTransaction(contractAddress, transactionId, {
  web3,
  callerKeys,
  config
}) {
  console.log(`\n[Multisig] Confirming wallet transaction`);
  console.log(`\n[Multisig] Transaction id: ${transactionId}`);
  const client = getClient(web3, callerKeys, config);
  const tx = await client.sendTransaction(MultisigWallet, contractAddress,
    'confirmTransaction', [transactionId]);

  console.log(`\n[Multisig] Transaction send: ${tx.transactionHash}`);
  const executeEvent = findLogType(tx, MultisigWallet.abi, 'Execution');
  if (executeEvent) {
    console.log(`\n[Multisig] Wallet transaction is executed`);
  }
  const failedEvent = findLogType(tx, MultisigWallet.abi, 'ExecutionFailure');
  if (failedEvent) {
    console.log(`\n[Multisig] Wallet transaction failed`);
    console.log(`\n[Multisig] Fail reason: ${failedEvent.reason}`);
  }
}

exports.handler = main;
exports.command = 'confirmtransaction [options]';
exports.describe = 'Confirm transaction to Multisig Wallet';
exports.builder = {
  ...builder,
  transactionId: {
    demandOption: true,
    type: 'string',
  },
};