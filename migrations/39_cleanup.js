require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const PoolStaking5 = artifacts.require('./PoolStaking/PoolStaking5.sol');
const PoolStakingRewards8 = artifacts.require('./PoolStakingRewards/PoolStakingRewards8.sol');
const PoolUtils3 = artifacts.require('./PoolUtils/PoolUtils3.sol');
const Pool16 = artifacts.require('./PoolCore/Pool16.sol');
const BaconCoin5 = artifacts.require('./BaconCoin/BaconCoin5.sol');
const Staking5 = artifacts.require('./Staking/Staking5.sol');

const {
  callContractMethodFromMultisig,
  upgradeContractFromMultisig,
  getMultisigAddress,
  getContractAddress,
} = require('./utils');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  const guardianAddress = getMultisigAddress(network);

  await upgradeContractFromMultisig(deployer, PoolStakingRewards8);
  await upgradeContractFromMultisig(deployer, PoolStaking5);
  await upgradeContractFromMultisig(deployer, PoolUtils3);
  await upgradeContractFromMultisig(deployer, Pool16);
  await upgradeContractFromMultisig(deployer, Staking5);

  if (network === 'mainnet') {
    await callContractMethodFromMultisig(deployer, BaconCoin5, '_pause', []);
  }
  await upgradeContractFromMultisig(deployer, BaconCoin5);

  await callContractMethodFromMultisig(deployer, BaconCoin5, 'setGuardian', [guardianAddress]);
 
  if (network == 'mainnet') {
    await callContractMethodFromMultisig(deployer, BaconCoin5, '_unpause', []);
  }
};
