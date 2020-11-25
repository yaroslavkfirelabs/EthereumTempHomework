const utils = require('web3-utils');

module.exports = {
    rpcUrl: "http://localhost:8545",
    gasLimit: 9000000,
    gasPrice: utils.toWei('1', 'gwei'),
    getReceiptInterval: 100,
    ethereumChain: 'mainnet',
}