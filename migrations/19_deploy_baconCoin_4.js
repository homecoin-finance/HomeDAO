require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const BN = web3.utils.BN;

const {
  getMultisigAddress,
  upgradeContractFromMultisig,
  deployNonUpgradableContract,
} = require('./utils');

const PoolStakingRewards1 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards1.sol'
);

const BaconCoinAirdropNewStaking = artifacts.require(
  './Airdrop/BaconCoinAirdropNewStaking.sol'
);

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, PoolStakingRewards1);

  await deployNonUpgradableContract(deployer, BaconCoinAirdropNewStaking, [
    getMultisigAddress(network),
  ]);
};
