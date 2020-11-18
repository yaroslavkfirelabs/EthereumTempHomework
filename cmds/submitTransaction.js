const {web3, deploymentAccountAddress, from, gasPrice, deploymentPrivateKey} = require('../utils/web3');
const {sendRawTx} = require('../utils');
const fs = require('fs');
const w3utils = require('web3-utils');
const {safeEnv} = require('../utils');
const MultisigWallet = require('../build/contracts/MultisigWallet');
const { address } = require(`../results.${safeEnv()}.json`);


async function main(argv) {
    const { to, amount, currencyType, bytecode, publicKey, privateKey } = argv;
    await submitTransaction(to, amount, currencyType, bytecode, publicKey, Buffer.from(privateKey, 'hex'));
};

async function submitTransaction(to, amount, currencyType, bytecode, publicKey, privateKey) {
    const nonce = await web3.eth.getTransactionCount(publicKey);
    console.log(`\n[Multisig] Submitting wallet transaction`);
    console.log(`\n[Multisig] To: ${to}`);
    console.log(`\n[Multisig] Amount: ${amount} ${currencyType}`);
    console.log(`\n[Multisig] Bytecode: ${bytecode}`);

    const options = {
        from,
        gasPrice
    };

    const instance = new web3.eth.Contract(MultisigWallet.abi, address, options);
    const value = w3utils.toWei(amount, currencyType);
    let data = await instance.methods.submitTransaction(to, value, bytecode).encodeABI();

    const tx = await sendRawTx({
        nonce: w3utils.toHex(nonce), 
        to: address,
        data,
        value: w3utils.toHex(value),
        privateKey
    });

    console.log(`\n[Multisig] Transaction send: ${tx.transactionHash}`);
    const log = decoder(tx.logs, MultisigWallet.abi)[0];
    console.log(`\n[Multisig] Transaction id: ${log.args.transactionId}`);
}

function decoder(logs, abi) {
    const topics = {};
    const args = abi.filter(x=>x.type === "event").forEach(e=>topics[e.signature]=e);
    
    let results = logs.filter(x=>x.topics.filter(t=>topics[t]).length > 0);
    return results.map(log=>{ return {args:web3.eth.abi.decodeLog(topics[log.topics[0]].inputs, log.data, log.topics), event:topics[log.topics[0]].name}});
} 

exports.handler = main;
exports.command = 'submitransaction [options]';
exports.describe = 'Submit transaction to Multisig Wallet';
exports.builder = {
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
  bytecode: {
      demandOption: false,
      type: 'string',
      default: '0x0'
  },
  publicKey: {
    demandOption: false,
    type: 'string',
    default: deploymentAccountAddress
  },
  privateKey: {
      demandOption: false,
      type: 'string',
      default: deploymentPrivateKey
  }
};