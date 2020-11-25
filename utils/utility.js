const fetch = require('node-fetch');
const assert = require('assert');
const Web3 = require('web3');


const sendNodeRequest = async (url, method, signedData) => {
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

const timeout = ms => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getReceipt = async (txHash, url, getReceiptInterval) => {
  await timeout(getReceiptInterval);
  let receipt = await sendNodeRequest(url, 'eth_getTransactionReceipt', txHash);
  if (receipt === null || !receipt.blockNumber) {
    receipt = await getReceipt(txHash, url);
  }
  return receipt;
}

const decodeLogs = (logs, abi) => {
  const web3 = new Web3();
  const topics = {};
  const args = abi.filter(x=>x.type === "event").forEach(e=>topics[e.signature]=e);
  
  let results = logs.filter(x=>x.topics.filter(t=>topics[t]).length > 0);
  return results.map(log=>{ return {args:web3.eth.abi.decodeLog(topics[log.topics[0]].inputs, log.data, log.topics), event:topics[log.topics[0]].name}});
} 

const findLogType = (tx, abi, logType) => {
  const decoded = decodeLogs(tx.logs, abi);
  const event = decoded.find(x => x.event == logType);
  return event && event.args;
}

module.exports = {
  sendNodeRequest,
  getReceipt,
  findLogType
}