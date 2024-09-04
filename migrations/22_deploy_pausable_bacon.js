require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const BN = web3.utils.BN;

const { upgradeContractFromMultisig } = require('./utils');

const BaconCoin4 = artifacts.require('./BaconCoin/BaconCoin4.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, BaconCoin4);
};
