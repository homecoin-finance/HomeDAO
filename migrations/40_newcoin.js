require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const BN = web3.utils.BN;

const RealWorldAsset = artifacts.require(
  './ACoinWithoutHog/RealWorldAsset.sol'
);
const OutsidePool3 = artifacts.require('./OutsidePool/OutsidePool3.sol');
const PoolStakingRewards9 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards9.sol'
);

const {
  getMultisigAddress,
  deployNonUpgradableContract,
  getContractAddress,
  callContractMethodFromMultisig,
  upgradeContractFromMultisig,
} = require('./utils');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await deployNonUpgradableContract(
    deployer,
    RealWorldAsset,
    [getMultisigAddress(network)],
    { networkConfigName: 'rwaCoinAddress' }
  );
  const rwaCoinAddress = getContractAddress(
    network,
    RealWorldAsset.contractName
  );

  await upgradeContractFromMultisig(deployer, OutsidePool3);
  await upgradeContractFromMultisig(deployer, PoolStakingRewards9);

  await callContractMethodFromMultisig(
    deployer,
    OutsidePool3,
    'setNewCoinAddress',
    [rwaCoinAddress]
  );
  await callContractMethodFromMultisig(
    deployer,
    PoolStakingRewards9,
    'setNewCoinAddress',
    [rwaCoinAddress]
  );

  if (network == 'development') {
    await callContractMethodFromMultisig(deployer, RealWorldAsset, 'mint', [
      getContractAddress(network, OutsidePool3.contractName),
      new BN('100000000000000000000000000000000000'),
    ]);
    await callContractMethodFromMultisig(deployer, RealWorldAsset, 'mint', [
      getContractAddress(network, PoolStakingRewards9.contractName),
      new BN('100000000000000000000000000000000000'),
    ]);
  }
};
