require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const { upgradeContractFromMultisig } = require('./utils');

const PoolStakingRewards2 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards2.sol'
);

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, PoolStakingRewards2);
};
