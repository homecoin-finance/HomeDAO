require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const {
  upgradeContractFromMultisig,
  deployUpgradableContract,
  getContractAddress,
  getMultisigAddress,
  callContractMethodFromMultisig,
} = require('./utils');

const Pool13 = artifacts.require('./PoolCore/Pool13.sol');

const PoolStakingRewards4 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards4.sol'
);

const Staking3 = artifacts.require('./Staking/Staking3.sol');

const HomeBoost0 = artifacts.require('./HomeBoost/HomeBoost0.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  let guardianAddress = getMultisigAddress(network);

  await upgradeContractFromMultisig(deployer, Pool13);

  const pool13Address = getContractAddress(network, Pool13.contractName);

  await upgradeContractFromMultisig(deployer, PoolStakingRewards4);

  await upgradeContractFromMultisig(deployer, Staking3);

  const poolStakingRewardsAddress = getContractAddress(
    network,
    PoolStakingRewards4.contractName
  );

  await deployUpgradableContract(
    deployer,
    HomeBoost0,
    [
      'HomeBoost',
      'HB',
      guardianAddress,
      pool13Address,
      poolStakingRewardsAddress,
    ],
    {
      networkConfigName: 'homeBoostAddress',
    }
  );

  const homeBoostAddress = getContractAddress(network, HomeBoost0.contractName);

  let baseBoostUri = 'null';

  if (network === 'development') {
  } else if (network === 'rinkeby') {
    baseBoostUri = 'https://files.homecoin.finance/boosts-rinkeby/';
  } else if (network === 'goerli') {
    baseBoostUri = 'https://files.homecoin.finance/boosts-rinkeby/';
  } else {
    // mainnet
    baseBoostUri = 'https://files.homcoin.finance/boosts/';
  }

  await callContractMethodFromMultisig(
    deployer,
    HomeBoost0,
    'setBoostBaseUri',
    [baseBoostUri]
  );

  await callContractMethodFromMultisig(deployer, Pool13, 'initializePool13', [
    homeBoostAddress,
  ]);

  await callContractMethodFromMultisig(
    deployer,
    PoolStakingRewards4,
    'approvePool',
    [homeBoostAddress]
  );
};
