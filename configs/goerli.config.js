const utils = require('web3-utils');

exports.deployment = {
    rpcUrl: "https://goerli.infura.io/v3/998f53d2d60e4359bf71dafab23c263e",
    gasLimit: 8000000,
    gasPrice: utils.toWei('1', 'gwei'),
    getReceiptInterval: 100,
    deploymentAccountAddress: "0x786E9DeB4e76D79290788f9641bfEdD45B71a2CB",
    deploymentPrivateKey: "4bf170cdec69734d9dd1fdc37518f87b972ad1f15267eddfc3db869a4605124e",
    ethereumChain: 'goerli',
    defaultOwners: ['0x786E9DeB4e76D79290788f9641bfEdD45B71a2CB', 
                    '0x29358E863A9FE3f90F664B76373300cb7Dc5B8d0', 
                    '0x83Bee6eF23B4Aa0bF6c00B2521826A96D99F9BBC']
}