require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const { upgradeContractFromMultisig } = require('./utils');

const Boost3 = artifacts.require('./HomeBoost/HomeBoost3.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, Boost3);
};
