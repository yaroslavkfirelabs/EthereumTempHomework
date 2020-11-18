const {
  web3,
  deploymentPrivateKey,
  rpcUrl,
  gasLimit,
  gasPrice,
  getReceiptInterval,
  ethereumChain
} = require('./web3');

const { Transaction } = require('ethereumjs-tx');
const utils = require('web3-utils');
const fetch = require('node-fetch');
const assert = require('assert');

async function deployContract(contractJson, args, {from, nonce, libraries}) {
  const options = {
      from,
      gasPrice
  };

  let bytecode = contractJson.bytecode;
  if (libraries !== undefined) {
      for (let key in libraries) {
          const placeholder = `__${key}`+"_".repeat(40-key.length-2);
          bytecode = bytecode.split(placeholder).join(libraries[key].replace("0x", ""));
      }
  }

  const instance = new web3.eth.Contract(contractJson.abi, options);
  let result = await instance.deploy({
      data: bytecode,
      arguments: args
  }).encodeABI();
  const tx = await sendRawTx({
      data: result,
      nonce: utils.toHex(nonce),
      to: null,
      privateKey: Buffer.from(deploymentPrivateKey, 'hex')
  });
  if (tx.status !== '0x1') {
      throw new Error(`Tx failed: ${JSON.stringify(tx)}`);
  }
  instance.options.address = tx.contractAddress;
  instance.deployedBlockNumber = tx.blockNumber;
  return instance;
}

async function sendRawTx({data, nonce, to, privateKey, value}) {
  try {
      const rawTx = {
          nonce,
          gasPrice: utils.toHex(gasPrice),
          gasLimit: utils.toHex(gasLimit),
          to,
          data,
          value
      };
      // console.log(rawTx);
      const tx = new Transaction(rawTx, { chain: ethereumChain });
      // console.log(`Raw Transaction: ${JSON.stringify(tx)}`);
      tx.sign(privateKey);
      // console.log(`Signed Transaction: ${JSON.stringify(tx)}`);
      const serializedTx = tx.serialize();
      // console.log(`Serialized Transaction: ${serializedTx}`);
      let time = new Date().getTime();
      const txHash = await sendNodeRequest(rpcUrl, 'eth_sendRawTransaction', `0x${serializedTx.toString('hex')}`);
      // console.log(`Request: ${(new Date().getTime() - time)/1000}s`)
      // console.log('pending txHash', txHash);
      time = new Date().getTime();
      const receipt = await getReceipt(txHash, rpcUrl);
      // console.log(`Receipt: ${(new Date().getTime() - time)/1000}s`)
      return receipt;
  } catch (err) {
      console.dir(err)
  }
}

async function sendNodeRequest(url, method, signedData) {    
  const request = await fetch(url, {
      headers: {
          'Content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params: [signedData],
          id: 1
      })
  });
  const json = await request.json();    
  if (method === 'eth_sendRawTransaction') {
      if (json.result) {
          assert.equal(json.result.length, 66, `Tx wasn't sent ${json}`);
      } else {
          console.error(`ERROR in tx: ${json.error.message}`);
          throw new Error(json.error.message);
      }
  }
  return json.result;
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getReceipt(txHash, url) {
  await timeout(getReceiptInterval);
  let receipt = await sendNodeRequest(url, 'eth_getTransactionReceipt', txHash);
  if (receipt === null || !receipt.blockNumber) {
      receipt = await getReceipt(txHash, url);
  }
  return receipt;
}

function compareHex(leftHex, rightHex) {
  return parseInt(leftHex, 16) === parseInt(rightHex, 16);
}

function safeEnv() {
  return process.env.ENV || 'development';
}

module.exports = {
  deployContract,
  sendNodeRequest,
  getReceipt,
  sendRawTx,
  compareHex,
  safeEnv
};