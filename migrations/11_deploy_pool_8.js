require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const {
  upgradeContractFromMultisig,
  callContractMethodFromMultisig,
  getContractAddress,
} = require('./utils');

const PoolStaking1 = artifacts.require('./PoolStaking/PoolStaking1.sol');
const Pool8 = artifacts.require('./PoolCore/Pool8.sol');
const Timelock = artifacts.require('./Governance/Timelock.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, PoolStaking1);

  await upgradeContractFromMultisig(deployer, Pool8);

  const timelockAddress = getContractAddress(network, Timelock.contractName);

  await callContractMethodFromMultisig(deployer, Pool8, 'initializePoolEight', [
    timelockAddress,
  ]);
};
