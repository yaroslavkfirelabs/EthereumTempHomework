const { Transaction } = require('ethereumjs-tx');
const utils = require('web3-utils');
const { sendNodeRequest, getReceipt } = require('./utility');

module.exports = (web3, callerKeys, config) => {
  const { gasPrice, gasLimit, ethereumChain, getReceiptInterval, rpcUrl } = config;

  async function deployContract(contractJson, args, libraries) {
    const nonce = await web3.eth.getTransactionCount(callerKeys.public);

    let bytecode = contractJson.bytecode;
    if (libraries !== undefined) {
      for (let key in libraries) {
        const placeholder = `__${key}` + "_".repeat(40 - key.length - 2);
        bytecode = bytecode.split(placeholder).join(libraries[key].replace("0x", ""));
      }
    }

    const options = {
      from: callerKeys.public,
      gasPrice
    };

    const instance = new web3.eth.Contract(contractJson.abi, options);
    let result = await instance.deploy({
      data: bytecode,
      arguments: args
    }).encodeABI();
    const tx = await sendRawTx({
      data: result,
      nonce: utils.toHex(nonce),
      to: null,
      privateKey: Buffer.from(callerKeys.private, 'hex')
    });
    if (tx.status !== '0x1') {
      throw new Error(`Tx failed: ${JSON.stringify(tx)}`);
    }
    instance.options.address = tx.contractAddress;
    instance.deployedBlockNumber = tx.blockNumber;
    return instance;
  }

  async function call(contractJson, address, method, arguments) {
    const instance = new web3.eth.Contract(contractJson.abi, address);
    return instance.methods[method](...arguments).call();
  }

  async function sendTransaction(contractJson, address, method, arguments, value) {
    const nonce = await web3.eth.getTransactionCount(callerKeys.public);
    const options = {
      from: callerKeys.public,
      gasPrice
    };
  
    const instance = new web3.eth.Contract(contractJson.abi, address, options);
    let data = await instance.methods[method](...arguments).encodeABI();
  
    const tx = await sendRawTx({
      nonce: utils.toHex(nonce),
      to: address,
      data,
      value: utils.toHex(value || '0'),
      privateKey: Buffer.from(callerKeys.private, 'hex')
    });
    if (tx.status !== '0x1') {
      throw new Error(`Tx failed: ${JSON.stringify(tx)}`);
    }
    return tx;
  }

  async function sendRawTx({
    data,
    nonce,
    to,
    privateKey,
    value
  }) {
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
      const tx = new Transaction(rawTx, {
        chain: ethereumChain
      });
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
      const receipt = await getReceipt(txHash, rpcUrl, getReceiptInterval);
      // console.log(`Receipt: ${(new Date().getTime() - time)/1000}s`)
      return receipt;
    } catch (err) {
      console.dir(err)
    }
  }

  return {
    deployContract,
    sendTransaction,
    call
  }
}