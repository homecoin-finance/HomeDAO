require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const {
  deployUpgradableContract,
  getContractAddress,
  getMultisigAddress,
  upgradeContractFromMultisig,
  callContractMethodFromMultisig,
  deployNonUpgradableContract,
} = require('./utils');

const Pool4 = artifacts.require('./PoolCore/Pool4.sol');
const PoolUtils0 = artifacts.require('./PoolUtils/PoolUtils0.sol');
const PoolStaking0 = artifacts.require('./PoolStaking/PoolStaking0.sol');
const BaconCoin0 = artifacts.require('./BaconCoin/BaconCoin0.sol');
const BaconCoinAirdrop = artifacts.require('./AirDrop/BaconCoinAirdrop.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  let loanSnapAddress = getMultisigAddress(network);
  let startingBlock = 13313474;
  let oneYearBlock = 15651074;
  let accrualBlock = 14127375;

  if (network === 'development') {
    startingBlock = await web3.eth.getBlock('latest');
    startingBlock = startingBlock.number;
    accrualBlock = startingBlock + 30;
    oneYearBlock = startingBlock + 100;
    console.log(startingBlock);
    console.log(accrualBlock);
    console.log(oneYearBlock);
  } else {
    if (network.startsWith('goerli')) {
      oneYearBlock = 11428185;
      startingBlock = 9991536;
    }
  }

  await upgradeContractFromMultisig(deployer, Pool4);

  const poolProxy = getContractAddress(network, Pool4.contractName);

  await deployUpgradableContract(deployer, PoolUtils0, [poolProxy], {
    networkConfigName: 'poolUtilsAddress',
  });

  const poolUtilsAddress = getContractAddress(network, PoolUtils0.contractName);

  await deployUpgradableContract(
    deployer,
    PoolStaking0,
    [poolProxy, loanSnapAddress, startingBlock, accrualBlock, oneYearBlock],
    { networkConfigName: 'poolStakingAddress' }
  );

  await deployNonUpgradableContract(
    deployer,
    BaconCoinAirdrop,
    [loanSnapAddress],
    {
      networkConfigName: 'baconCoinAirdropAddress',
    }
  );

  const poolStakingAddress = getContractAddress(
    network,
    PoolStaking0.contractName
  );

  await deployUpgradableContract(
    deployer,
    BaconCoin0,
    [
      'BaconCoin',
      'BACON',
      poolStakingAddress,
      getContractAddress(network, BaconCoinAirdrop.contractName),
    ],
    {
      networkConfigName: 'baconCoinAddress',
    }
  );

  const baconAddress = getContractAddress(network, BaconCoin0.contractName);

  await callContractMethodFromMultisig(deployer, Pool4, 'initializePoolFour', [
    poolUtilsAddress,
    baconAddress,
    poolStakingAddress,
  ]);

  await callContractMethodFromMultisig(
    deployer,
    PoolStaking0,
    'setBaconAddress',
    [baconAddress]
  );

  if (network === 'development') {
    const deployedPool4 = await Pool4.deployed();
    console.log('about to stake 50 bHOME');
    await deployedPool4.stake(50000000);
  }
};
