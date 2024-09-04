require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const {
  upgradeContractFromMultisig,
  deployNonUpgradableContract,
  getContractAddress,
} = require('./utils');

const Pool12 = artifacts.require('./PoolCore/Pool12.sol');

const PoolStakingRewards3 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards3.sol'
);

const Staking2 = artifacts.require('./Staking/Staking2.sol');

const TestRewards0 = artifacts.require('./TestRewards/TestRewards0.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, Pool12, {
    unsafeSkipStorageCheck: true,
  });

  await upgradeContractFromMultisig(deployer, PoolStakingRewards3);

  await upgradeContractFromMultisig(deployer, Staking2);

  if (network === 'development') {
    const poolAddress = getContractAddress(network, Pool12.contractName);
    await deployNonUpgradableContract(deployer, TestRewards0, [poolAddress]);
  }
};
