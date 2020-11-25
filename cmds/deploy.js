const {
  setup,
  builder
} = require('./common');
const getClient = require('../utils/client');
const MultisigWallet = require('../build/contracts/MultisigWallet');
const fs = require('fs');


async function main(argv) {
  const context = setup(argv);

  const {
    config
  } = context;
  const owners = argv.owners || config.publicKeys.slice(0, argv.ownersCount);

  const output = await deployMultisigWallet(owners, argv.requiredSigs, context);
  fs.writeFileSync(`./results.${context.environment}.json`, JSON.stringify(output, null, 4));
};

async function deployMultisigWallet(owners, requiredSigs, {web3, callerKeys, config}) {
  console.log(`\n[Multisig] deploying Multisig wallet.`);
  console.log(`\n[Multisig] owners: ${owners}`);
  console.log(`\n[Multisig] required signatures: ${requiredSigs}`);
  const client = getClient(web3, callerKeys, config);
  const wallet = await client.deployContract(MultisigWallet, [owners, requiredSigs]);
  console.log(`\n[Multisig] Deployed to address: ${wallet.options.address}.`);

  return {
    address: wallet.options.address
  }
}


exports.handler = main;
exports.command = 'deploy [options]';
exports.describe = 'deploys Multisig Wallet';
exports.builder = {
  ...builder,
  ownersCount: {
    demandOption: false,
    type: 'array',
    string: true,
    default: 3,
    description: 'Number of first addresses to get as owners from the environment'
  },
  owners: {
    demandOption: false,
    type: 'array',
    string: true,
    description: 'Explicidly set owners. Precedes ownersCount'
  },
  requiredSigs: {
    demandOption: false,
    type: 'number',
    default: 2,
  }
};