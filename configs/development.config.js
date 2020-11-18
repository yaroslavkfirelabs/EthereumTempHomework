const utils = require('web3-utils');

exports.deployment = {
    rpcUrl: "http://localhost:8545",
    gasLimit: 9000000,
    gasPrice: utils.toWei('1', 'gwei'),
    getReceiptInterval: 100,
    deploymentAccountAddress: "0x1bb7554cBeaAa27ae56573C87A57344F67B74b85",
    deploymentPrivateKey: "e2c85576dfbc49c1f3d24bed05c97d17205e9896f0388603ab1fb9683236f122",
    ethereumChain: 'mainnet',
    defaultOwners: ['0x1bb7554cBeaAa27ae56573C87A57344F67B74b85', 
                    '0x5391b723e72a4BFB9c7fAa063ff89B688A36E627', 
                    '0xfdE925a53Da7d4ae925D5ea35003B5234cC07C74']
}