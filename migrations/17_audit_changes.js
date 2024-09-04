const {
  upgradeContractFromMultisig,
  callContractMethodFromMultisig,
  getContractAddress,
} = require('./utils');

const Pool9 = artifacts.require('./PoolCore/Pool9.sol');

const BaconCoin2 = artifacts.require('./BaconCoin/BaconCoin2.sol');

const PoolStaking3 = artifacts.require('./PoolStaking/PoolStaking3.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, Pool9);

  await upgradeContractFromMultisig(deployer, PoolStaking3);

  await upgradeContractFromMultisig(deployer, BaconCoin2);

  await callContractMethodFromMultisig(deployer, Pool9, 'initializePool9', []);

  const poolAddress = getContractAddress(network, Pool9.contractName);
  await callContractMethodFromMultisig(
    deployer,
    PoolStaking3,
    'initializePoolStaking3',
    [poolAddress]
  );
};
