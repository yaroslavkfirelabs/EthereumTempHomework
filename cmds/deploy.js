const {web3, deploymentAccountAddress, defaultOwners} = require('../utils/web3');
const {deployContract} = require('../utils');
const MultisigWallet = require('../build/contracts/MultisigWallet');
const fs = require('fs');


async function main(argv) {
  const output = await deployMultisigWallet(argv.owners, argv.requiredSigs);
  fs.writeFileSync(`./results.${process.env.ENV}.json`, JSON.stringify(output, null, 4));
};

async function deployMultisigWallet(owners, requiredSigs) {
    const nonce = await web3.eth.getTransactionCount(deploymentAccountAddress);
    console.log(`\n[Multisig] deploying Multisig wallet.`);
    console.log(`\n[Multisig] owners: ${owners}`);
    console.log(`\n[Multisig] required signatures: ${requiredSigs}`);
    const wallet = await deployContract(MultisigWallet, [owners, requiredSigs], {from: deploymentAccountAddress, nonce});
    console.log(`\n[Multisig] Deployed to address: ${wallet.options.address}.`);

    return {
        address: wallet.options.address
    }
}


exports.handler = main;
exports.command = 'deploy [options]';
exports.describe = 'deploys Multisig Wallet';
exports.builder = {
  owners: {
    demandOption: true,
    type: 'array',
    string: true,
    default: defaultOwners
  },
  requiredSigs: {
    demandOption: false,
    type: 'number',
    default: 2
  }
};