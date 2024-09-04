require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const { upgradeContractFromMultisig } = require('./utils');

const Boost2 = artifacts.require('./HomeBoost/HomeBoost2.sol');

const Staking4 = artifacts.require('./Staking/Staking4.sol');

const PoolStakingRewards5 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards5.sol'
);

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, Boost2);

  await upgradeContractFromMultisig(deployer, Staking4);

  await upgradeContractFromMultisig(deployer, PoolStakingRewards5);
};
