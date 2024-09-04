require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const {
  getMultisigAddress,
  getContractAddress,
  deployNonUpgradableContract,
  updateNetworkConfig,
  getNetworkConfig,
  callContractMethodFromMultisig,
  deployUpgradableContract,
  upgradeContractFromMultisig,
} = require('./utils');

const DevSushiBaconEthLPToken = artifacts.require(
  './DevSushiBaconEthLPToken.sol'
);
const DevCurveHome3Crv = artifacts.require('./DevCurveHome3Crv.sol');

const Staking3 = artifacts.require('./Staking/Staking3.sol');

const OutsidePool0 = artifacts.require('./OutsidePool/OutsidePool0.sol');

const PoolStakingRewards6 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards6.sol'
);

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  if (network !== 'mainnet' && network !== 'mainnet-fork') {
    // Deploy a test ERC20s to be LP tokens
    await deployNonUpgradableContract(deployer, DevSushiBaconEthLPToken, []);
    await deployNonUpgradableContract(deployer, DevCurveHome3Crv, []);

    const sushiLP = await DevSushiBaconEthLPToken.deployed();
    const curveLP = await DevCurveHome3Crv.deployed();

    updateNetworkConfig(network, (config) => {
      config['lpStakable'] = {
        sushiBaconEth: sushiLP.address,
        curveHome3crv: curveLP.address,
      };
    });
  }
  // Otherwise we expect that the LP tokens have been set up in the networkConfig manually

  const networkConfig = getNetworkConfig(network);

  const guardianAddress = getMultisigAddress(network);

  //
  // This is a redeploy of the OutsidePool contract as somethine went sideways with the previous
  // deploy
  //
  let numberOfEpochs;
  if (network === 'development') {
    numberOfEpochs = 2000;
  } else if (network === 'goerli') {
    numberOfEpochs = 2000;
  } else {
    // Mainnet
    // Match the number of epochs that we are supposed to have in the PoolStakingRewards contract
    // 19 for the number of weeks remaining in the first year of double rewards +
    // 52 for the following year.
    numberOfEpochs = 19 + 52;
  }

  await deployUpgradableContract(
    deployer,
    OutsidePool0,
    [
      guardianAddress,
      networkConfig.poolStakingRewardsAddress,
      networkConfig.stakingAddress,
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

  await callContractMethodFromMultisig(deployer, OutsidePool0, 'approvePool', [
    networkConfig.lpStakable.sushiBaconEth,
    '96153846154000000000000', // 5M / 52
  ]);

  await callContractMethodFromMultisig(deployer, OutsidePool0, 'approvePool', [
    networkConfig.lpStakable.curveHome3crv,
    '192307692308000000000000', //10M / 52
  ]);
};
