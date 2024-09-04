const {
  increaseTo,
  latest,
  increase,
} = require('@openzeppelin/test-helpers/src/time');
const snapshot = require('@openzeppelin/test-helpers/src/snapshot');
const { assert } = require('chai');

const Staking = artifacts.require('./Staking/Staking3.sol');
const PoolCore = artifacts.require('./PoolCore/Pool13.sol');
const DevUSDC = artifacts.require('./DevUSDC.sol');
const PropToken = artifacts.require('./PropTokens/PropToken0.sol');
const Timelock = artifacts.require('./Governance/Timelock.sol');
const PoolStaking = artifacts.require('./PoolStaking4.sol');
const PoolStakingRewards = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards0.sol'
);
const OutsidePool = artifacts.require('./OutsidePool/OutsidePool1.sol');

const BN = web3.utils.BN;

contract('HomeBoost', (accounts) => {
  let startSnapshot = null;
  beforeEach(async () => {
    startSnapshot = await snapshot();
  });

  it('OutsidePool1: should harvest bacon', async () => {
    const guard = {from: accounts[0]};
    const DevUSDCInstance = await DevUSDC.deployed();
    const OutsidePoolInstance = await OutsidePool.deployed();
    const PoolStakingRewardsInstance = await PoolStakingRewards.deployed();

    const epochStart = await PoolStakingRewardsInstance.epochStart();
    const epochDuration = await PoolStakingRewardsInstance.epochDuration();

      await DevUSDCInstance.approve(
        OutsidePoolInstance.address,
        new BN('100000000000'),
        { from: accounts[0] }
      );

    await increaseTo(epochStart.add(epochDuration.mul(new BN('1'))));
    await OutsidePoolInstance.approvePool(DevUSDCInstance.address, new BN('7000000000000000000'), true, guard);
    await OutsidePoolInstance.initializePoolEpochs(DevUSDCInstance.address, 0, 1);

    await OutsidePoolInstance.stake(DevUSDCInstance.address, new BN('100000000000'), guard);
    await increaseTo(epochStart.add(epochDuration.mul(new BN('2'))));


    var baconRewards = await OutsidePoolInstance.massHarvest.call(
      DevUSDCInstance.address,
      accounts[0],
      {
        from: accounts[0],
      }
    );

    const notBaconRewards = await OutsidePoolInstance.massHarvest.call(
      DevUSDCInstance.address,
      accounts[1],
      {
        from: accounts[1],
      }
    );
      

    // bacon earned should be > 0
    console.log('REWARDS:', baconRewards.toString());
    assert.equal(baconRewards.toString(), '7000000000000000000');
    console.log('REWARDS:', notBaconRewards.toString());
    assert.equal(notBaconRewards.toString(), '0');

    await OutsidePoolInstance.unstake(DevUSDCInstance.address, new BN('100000000000'), guard);
    await increaseTo(epochStart.add(epochDuration.mul(new BN('7'))));

    baconRewards = await OutsidePoolInstance.massHarvest.call(
      DevUSDCInstance.address,
      accounts[0],
      {
        from: accounts[0],
      }
    );
    console.log('REWARDS:', baconRewards.toString());
    // Should get rewards for the one after, but not any more.
    assert.equal(baconRewards.toString(), '7000000000000000000');
      
      
  });

  afterEach(async () => {
    console.log('restoring state');
    startSnapshot.restore();
  });
});
