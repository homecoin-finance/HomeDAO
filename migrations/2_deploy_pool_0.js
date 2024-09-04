require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { singletons } = require('@openzeppelin/test-helpers');

const fs = require('fs');

const {
  deployUpgradableContract,
  getContractAddress,
  getMultisigAddress,
  deployNonUpgradableContract,
  updateNetworkConfig,
} = require('./utils');

const Pool0 = artifacts.require('./PoolCore/Pool0.sol');
const DUSDC = artifacts.require('./DevUSDC.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  let multisigAddress = getMultisigAddress(network);

  if (network == 'development') {
    await await singletons.ERC1820Registry(accounts[0]);
  } else if (network === 'goerli') {
    await await singletons.ERC1820Registry(accounts[1]);
  }

  if (network !== 'mainnet' && network !== 'mainnet-fork') {
    await deployNonUpgradableContract(deployer, DUSDC, [], {
      networkConfigName: 'usdcAddress',
    });
    USDCInstance = await DUSDC.deployed();
    await USDCInstance.transfer(accounts[1], 9999000000);
  }

  const usdcAddress = getContractAddress(network, DUSDC.contractName);

  await deployUpgradableContract(
    deployer,
    Pool0,
    ['HCPool', 'hcp', usdcAddress, multisigAddress, multisigAddress],
    {
      networkConfigName: 'poolAddress',
    }
  );

  updateNetworkConfig(network, (networkConfig) => {
    networkConfig.seededAddress = deployer.options.from;
  });

  if (network === 'development') {
    const PoolInstance = await Pool0.deployed();
    //for testing purposes, add a loan to the pool before upgrading to pool1
    await USDCInstance.approve(
      PoolInstance.address,
      web3.utils
        .toBN(
          'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        )
        .toString()
    );
    await PoolInstance.lend(100000000);
    await PoolInstance.borrow(1000000, accounts[0], 500000000, {
      from: multisigAddress,
    });
  }
};
