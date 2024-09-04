require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const {
  upgradeContractFromMultisig,
  callContractMethodFromMultisig,
} = require('./utils');

const PoolStakingRewards7 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards7.sol'
);

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, PoolStakingRewards7);

  let percentArrayArgs;
  if (network === 'development') {
    // These values are for testing/dev network only.
    // Should be (52, 64782, 20)
    const fixedPercent = Math.floor(65536 * 0.9885);
    percentArrayArgs = [52, fixedPercent, 2000];
  } else {
    percentArrayArgs = [52, 64468, 20];
  }

  await callContractMethodFromMultisig(
    deployer,
    PoolStakingRewards7,
    'fillPercentArray',
    percentArrayArgs
  );
};
