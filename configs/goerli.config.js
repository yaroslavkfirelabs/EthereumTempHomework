const utils = require('web3-utils');

module.exports = {
    rpcUrl: "https://goerli.infura.io/v3/998f53d2d60e4359bf71dafab23c263e",
    gasLimit: 8000000,
    gasPrice: utils.toWei('1', 'gwei'),
    getReceiptInterval: 100,
    ethereumChain: 'goerli',
}