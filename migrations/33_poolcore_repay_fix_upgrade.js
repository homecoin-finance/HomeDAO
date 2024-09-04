require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const { BN } = require('@openzeppelin/test-helpers');
const { upgradeProxy, deployProxy } = require('@openzeppelin/truffle-upgrades');

const fs = require('fs');

const Pool14 = artifacts.require('./PoolCore/Pool14.sol');
const Pool15 = artifacts.require('./PoolCore/Pool15.sol');
const PoolCoreTest = artifacts.require('./PoolCoreTest/PoolTest15.sol');

const {
  deployUpgradableContract,
  upgradeContractFromMultisig,
  upgradeOverrideContractFromMultisig,
  callContractMethodFromMultisig,
  getContractAddress,
  forceImportContract,
} = require('./utils');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  //Get contract addresses:
  var poolAddress = getContractAddress(network, Pool14.contractName);

  if (network === 'development') {
    await upgradeOverrideContractFromMultisig(deployer, Pool14, PoolCoreTest);
    const deployedTestPool15 = await PoolCoreTest.at(poolAddress);
  }

  await upgradeContractFromMultisig(deployer, Pool15);
};
