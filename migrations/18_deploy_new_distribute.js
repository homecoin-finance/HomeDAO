const {
  getMultisigAddress,
  upgradeContractFromMultisig,
  callContractMethodFromMultisig,
  deployUpgradableContract,
  getContractAddress,
} = require('./utils');

const Pool10 = artifacts.require('./PoolCore/Pool10.sol');

const BaconCoin3 = artifacts.require('./BaconCoin/BaconCoin3.sol');

const PoolStaking4 = artifacts.require('./PoolStaking/PoolStaking4.sol');

const Staking0 = artifacts.require('./Staking/Staking0.sol');
const PoolStakingRewards0 = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards0.sol'
);

const BN = web3.utils.BN;

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  // These are the mainnet values
  let loanSnapAddress = getMultisigAddress(network);
  let epochStart = 1652907600; // 5/17/2022 @ 5 pm EST
  let epochDuration = 60 * 60 * 24 * 7;
  let rewardPerEpoch = new BN('5399352.631578940000000000');
  let numberOfEpochs = 19;
  let poolCoreAddress = getContractAddress(network, Pool10.contractName);
  let baconCoinAddress = getContractAddress(network, BaconCoin3.contractName);

  if (network === 'development') {
    epochStart = 1904625191;
    // epochDuration = 60 * 10; // uncomment if you want 10 min epochs locally (you probably don't as you can change the time of the local chain)
    rewardPerEpoch = new BN('6348745833333333333333333');
    numberOfEpochs = 2000;
  } else if (network === 'goerli') {
    epochStart = 1652734809;
    epochDuration = 60 * 60;
    rewardPerEpoch = new BN('37790153770000000000000');
    //no idea why but the contract initialization crashes if this is somewhere between 2001 & 3000
    numberOfEpochs = 2000;
  }

  await upgradeContractFromMultisig(deployer, Pool10);

  await upgradeContractFromMultisig(deployer, PoolStaking4);

  await upgradeContractFromMultisig(deployer, BaconCoin3);

  await deployUpgradableContract(
    deployer,
    Staking0,
    [loanSnapAddress, epochStart, epochDuration],
    { networkConfigName: 'stakingAddress' }
  );

  const stakingAddress = getContractAddress(network, Staking0.contractName);

  const poolStakingRewards0Instance = await deployUpgradableContract(
    deployer,
    PoolStakingRewards0,
    [
      loanSnapAddress,
      baconCoinAddress,
      poolCoreAddress,
      stakingAddress,
      rewardPerEpoch,
      numberOfEpochs,
    ],
    { networkConfigName: 'poolStakingRewardsAddress' }
  );

  // Link up all the contracts
  // await Pool10Instance.linkPoolStaking(Staking0Instance.address);
  await callContractMethodFromMultisig(deployer, Pool10, 'linkPoolStaking', [
    stakingAddress,
  ]);

  // await Pool10Instance.linkPoolStakingReward(
  //   PoolStakingRewards0Instance.address
  // );
  const poolStakingRewardsAddress = getContractAddress(
    network,
    PoolStakingRewards0.contractName
  );
  await callContractMethodFromMultisig(
    deployer,
    Pool10,
    'linkPoolStakingReward',
    [poolStakingRewardsAddress]
  );

  // await Staking0Instance.approveAccess(PoolStakingRewards0Instance.address);
  await callContractMethodFromMultisig(
    deployer,
    Staking0,
    'approveAccess',
    [poolStakingRewardsAddress],
    'Staking0.json'
  );

  // await PoolStakingRewards0Instance.approvePool(Pool10Instance.address);
  await callContractMethodFromMultisig(
    deployer,
    PoolStakingRewards0,
    'approvePool',
    [poolCoreAddress]
  );

  const poolStakingAddress = getContractAddress(
    network,
    PoolStaking4.contractName
  );

  // await PoolStakingRewards0Instance.approvePool(deployedPoolStaking4.address);
  await callContractMethodFromMultisig(
    deployer,
    PoolStakingRewards0,
    'approvePool',
    [poolStakingAddress]
  );

  // await deployedPoolStaking4.setNewStakingContract(
  //   PoolStakingRewards0Instance.address
  // );
  await callContractMethodFromMultisig(
    deployer,
    PoolStaking4,
    'setNewStakingContract',
    [poolStakingRewardsAddress]
  );

  await callContractMethodFromMultisig(
    deployer,
    PoolStaking4,
    'transferMintRights',
    [poolStakingRewardsAddress]
  );

  // TODO:
  /*
   * if needed:
   * 12. deployedPoolStaking4.transferAllStakes(staking0Address, [accounts[0]], [stakedByAccounts0], 1)
   */

  if (network === 'development') {
    const deployedPoolStaking4 = await PoolStaking4.deployed();
    //if rerunning deployment 18 locally, these lines will crash on second and following passes
    let stakedByAccounts0 = await deployedPoolStaking4.userStaked(accounts[0]);
    if (stakedByAccounts0 > 0) {
      await deployedPoolStaking4.transferAllStakes(
        stakingAddress,
        [accounts[0]],
        [stakedByAccounts0],
        1
      );
    }
  }
};
