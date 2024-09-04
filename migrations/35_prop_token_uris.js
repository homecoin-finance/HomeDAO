require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const PropToken1 = artifacts.require('./PropTokens/PropToken1.sol');

const { upgradeContractFromMultisig } = require('./utils');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }
  await upgradeContractFromMultisig(deployer, PropToken1);
};
