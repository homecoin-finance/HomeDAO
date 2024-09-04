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

const PoolStakingRewards6 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards6.sol'
);

const Staking3 = artifacts.require('./Staking/Staking3.sol');

const OutsidePool0 = artifacts.require('./OutsidePool/OutsidePool0.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  const guardianAddress = getMultisigAddress(network);

  await upgradeContractFromMultisig(deployer, PoolStakingRewards6);

  const poolStakingRewardsAddress = getContractAddress(
    network,
    PoolStakingRewards6.contractName
  );
  const stakingAddress = getContractAddress(network, Staking3.contractName);

  let numberOfEpochs;
  if (network === 'development') {
    numberOfEpochs = 2000;
  } else if (network === 'goerli') {
    numberOfEpochs = 2000;
  } else {
    numberOfEpochs = 19;
  }

  await deployUpgradableContract(
    deployer,
    OutsidePool0,
    [
      guardianAddress,
      poolStakingRewardsAddress,
      stakingAddress,
      numberOfEpochs,
    ],
    { networkConfigName: 'outsidePoolAddress' }
  );

  const outsidePoolAddress = getContractAddress(
    network,
    OutsidePool0.contractName
  );

  await callContractMethodFromMultisig(deployer, Staking3, 'approveAccess', [
    outsidePoolAddress,
  ]);

  await callContractMethodFromMultisig(
    deployer,
    PoolStakingRewards6,
    'approveSubMinter',
    [outsidePoolAddress]
  );
};
