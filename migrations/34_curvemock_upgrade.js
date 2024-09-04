require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const CurveMock1 = artifacts.require('./CurveMock/CurveMock1.sol');

const {
  upgradeContractFromMultisig,
} = require('./utils');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }
  if (network == 'goerli' || 'development') {
    await upgradeContractFromMultisig(deployer, CurveMock1);
  }
};
