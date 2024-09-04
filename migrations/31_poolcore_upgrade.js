require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const { BN } = require('@openzeppelin/test-helpers');
const { upgradeProxy, deployProxy } = require('@openzeppelin/truffle-upgrades');

const fs = require('fs');

const Pool13 = artifacts.require('./PoolCore/Pool13.sol');
const Pool14 = artifacts.require('./PoolCore/Pool14.sol');
const PoolCoreTest = artifacts.require('./PoolCoreTest/PoolTest14.sol');

const CurveMock0 = artifacts.require('./CurveMock/CurveMock0.sol');
const DevUSDC = artifacts.require('./DevUSDC.sol');

const {
  deployUpgradableContract,
  upgradeContractFromMultisig,
  upgradeOverrideContractFromMultisig,
  callContractMethodFromMultisig,
  getContractAddress,
  forceImportContract,
} = require('./utils');

module.exports = async function (deployer, network, accounts) {
  await forceImportContract(deployer, Pool13);

  if (network === 'testing') {
    return;
  }

  //Get contract addresses:
  var curveAddress = '0x5c6a6cf9ae657a73b98454d17986af41fc7b44ee';
  var poolAddress = getContractAddress(network, Pool13.contractName);

  if (network === 'development') {
    const deployedCurveMock0 = await deployUpgradableContract(
      deployer,
      CurveMock0,
      [],
      {}
    );
    curveAddress = deployedCurveMock0.address;
    timelockAddress = getContractAddress(network, 'Timelock');

    const deployedDevUSDC = await DevUSDC.deployed();

    await upgradeOverrideContractFromMultisig(deployer, Pool13, PoolCoreTest);

    const deployedTestPool14 = await PoolCoreTest.at(poolAddress);

    await deployedTestPool14.mintForTest(
      curveAddress,
      new BN('1000000000000000000000'),
      { from: accounts[0] }
    );
    // While we are here, make sure the timelock has enough Home to pay rewards.
    await deployedTestPool14.mintForTest(
      timelockAddress,
      new BN('1000000000000000000000'),
      { from: accounts[0] }
    );
    await deployedCurveMock0.addCurrency(2, deployedDevUSDC.address);
    await deployedDevUSDC.gimmeDollarydoos(
      curveAddress,
      new BN('1000000000000000000000')
    );
    await deployedCurveMock0.addCurrency(0, deployedTestPool14.address);
  }

  if (network == 'goerli') {
    const deployedDevUSDCAddress = getContractAddress(
      network,
      DevUSDC.contractName
    );

    const deployedCurveMock0 = await deployUpgradableContract(
      deployer,
      CurveMock0,
      [],
      {}
    );
    curveAddress = deployedCurveMock0.address;

    await deployedCurveMock0.addCurrency(2, deployedDevUSDCAddress);
    await deployedCurveMock0.addCurrency(0, poolAddress);
  }

  await upgradeContractFromMultisig(deployer, Pool14);
  await callContractMethodFromMultisig(deployer, Pool14, 'initializePool14', [
    curveAddress,
  ]);
};
