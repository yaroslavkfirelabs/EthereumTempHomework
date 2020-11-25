const {
  getConfigs
} = require('../utils/configs');
const {
  constructWeb3
} = require('../utils/web3');

exports.setup = argv => {
  const {
    environment,
    callerNumber
  } = argv;

  const config = getConfigs(environment)

  return {
    environment,
    config,
    web3: constructWeb3(config.rpcUrl),
    callerKeys: {
      public: config.publicKeys[callerNumber - 1],
      private: config.privateKeys[callerNumber - 1],
    }
  }
};

exports.builder = {
  environment: {
    demandOption: false,
    type: 'string',
    default: process.env.ENV || 'development',
    describe: 'Environment to run command in. Defaults to ENV environment variable first and then to "development"'
  },
  callerNumber: {
    demandOption: false,
    type: 'number',
    default: 1,
    describe: 'Number of private and public key from environment to execute from'
  }
};