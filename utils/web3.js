const Web3 = require('web3');

exports.constructWeb3 = rpcUrl => {
    const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
    return new Web3(web3Provider);
} 