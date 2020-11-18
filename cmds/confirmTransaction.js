const {web3, deploymentAccountAddress, from, gasPrice, deploymentPrivateKey} = require('../utils/web3');
const {sendRawTx} = require('../utils');
const fs = require('fs');
const w3utils = require('web3-utils');
const {safeEnv} = require('../utils');
const MultisigWallet = require('../build/contracts/MultisigWallet');
const { address } = require(`../results.${safeEnv()}.json`);


async function main(argv) {
    const { transactionId, publicKey, privateKey } = argv;
    await confirmTransaction(transactionId, publicKey, Buffer.from(privateKey, 'hex'));
};

async function confirmTransaction(transactionId, publicKey, privateKey) {
    const nonce = await web3.eth.getTransactionCount(publicKey);
    console.log(`\n[Multisig] Confirming wallet transaction`);
    console.log(`\n[Multisig] Id: ${transactionId}`);

    const options = {
        from,
        gasPrice
    };

    const instance = new web3.eth.Contract(MultisigWallet.abi, address, options);
    let data = await instance.methods.confirmTransaction(transactionId).encodeABI();

    const tx = await sendRawTx({
        nonce: w3utils.toHex(nonce), 
        to: address,
        data,
        value: 0,
        privateKey
    });

    console.log(`\n[Multisig] Transaction send: ${tx.transactionHash}`);
    const log = decoder(tx.logs, MultisigWallet.abi);
    if (log.length > 0) {
        console.log(`\n[Multisig] Wallet transaction is executed`);
    }
}

function decoder(logs, abi) {
    const topics = {};
    const args = abi.filter(x=>x.type === "event").forEach(e=>topics[e.signature]=e);
    
    let results = logs.filter(x=>x.topics.filter(t=>topics[t]).length > 0);
    return results.map(log=>{ return {args:web3.eth.abi.decodeLog(topics[log.topics[0]].inputs, log.data, log.topics), event:topics[log.topics[0]].name}});
} 

exports.handler = main;
exports.command = 'confirmtransaction [options]';
exports.describe = 'Confirm transaction to Multisig Wallet';
exports.builder = {
  transactionId: {
    demandOption: true,
    type: 'string',
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