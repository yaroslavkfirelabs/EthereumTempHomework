const environment = process.env.ENV || "development";
let deploymentConfig = {};

if (environment == "development") {
  deploymentConfig = require('../configs/development.config').deployment;
} else if (environment == "goerli") {
  deploymentConfig = require('../configs/goerli.config').deployment;
} else {
  throw new Error("Given environment is not supported yet.");
}

const Web3 = require('web3');
const web3Provider = new Web3.providers.HttpProvider(deploymentConfig.rpcUrl);
const web3 = new Web3(web3Provider);

module.exports = {
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
  web3,
  ...deploymentConfig
};
