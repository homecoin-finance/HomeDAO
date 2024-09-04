require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const OutsidePool1 = artifacts.require('./OutsidePool/OutsidePool1.sol');

const {
  upgradeContractFromMultisig,
} = require('./utils');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }
  if (network == 'goerli' || 'development') {
    await upgradeContractFromMultisig(deployer, OutsidePool1);
  }
};
