const { increaseTo, increase } = require('@openzeppelin/test-helpers/src/time');
const snapshot = require('@openzeppelin/test-helpers/src/snapshot');
const { assert } = require('chai');

const PoolStaking = artifacts.require('./PoolStaking/PoolStaking5.sol');
const Staking = artifacts.require('./Staking/Staking5.sol');
const PoolCore = artifacts.require('./PoolCore/Pool14.sol');
const DevUSDC = artifacts.require('./DevUSDC.sol');
const Timelock = artifacts.require('./Governance/Timelock.sol');
const PoolStakingRewards = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards7.sol'
);

const BN = web3.utils.BN;

contract('PoolStaking', (accounts) => {
  //in this test 50 bHOME is proved to be staked by account[0]
  it('should have 50 bHOME staked by the first account after deploys', async () => {
    const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
    deployedPoolStakingRewards.approvePool(accounts[0]);
    const balance = await deployedPoolStakingRewards.getCurrentBalance(accounts[0]);

    //set value toString because it is BigNumber
    assert.equal(
      balance.valueOf().toString(),
      '50000000',
      "50 bHOME wasn't staked in the first account"
    );
  });

  it('should start unstaking lockup of 50 bHOME from staking', async () => {
    const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
    await deployedPoolStakingRewards.unstakeForWallet(accounts[0], 50000000, { from: accounts[0] });

    //set value toString because it is BigNumber
    const balance = await deployedPoolStakingRewards.getCurrentBalance(accounts[0]);
    assert.equal(
      balance.valueOf().toString(),
      '0',
      "50 bHOME wasn't unstaked by the first account"
    );
  });

  it('should earn no bacon in epoch 0', async () => {
    let startSnapshot = await snapshot();
    try {
      const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
      const epochStart = await deployedPoolStakingRewards.epochStart();
      const epochDuration = await deployedPoolStakingRewards.epochDuration();

      // stake in epoch 0
      const deployedPoolCore = await PoolCore.deployed();
      await deployedPoolCore.boost(10000000, 1, false);

      // forward time to the beginning of the first epoch (roughly)
      // because rewards aren't paid until the end of the epoch
      await increaseTo(epochStart.add(epochDuration.div(new BN('2'))));

      let currentEpoch = await deployedPoolStakingRewards.getCurrentEpoch();
      assert.equal(currentEpoch.toString(), '1', 'Should be at epoch 1');

      let rewards = await deployedPoolStakingRewards.massHarvest.call(accounts[0]);

      assert.equal(
        rewards.toString(),
        '0',
        'No account should earn bacon in epoch 0'
      );
    } finally {
      await startSnapshot.restore();
    }
  });

  it('should earn all bacon in epoch 1', async () => {
    let startSnapshot = await snapshot();
    try {
      const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
      const epochStart = await deployedPoolStakingRewards.epochStart();
      const epochDuration = await deployedPoolStakingRewards.epochDuration();
      const rewardPerEpoch =
        await deployedPoolStakingRewards.getRewardPerEpoch();

      const deployedPoolCore = await PoolCore.deployed();
      const devUSDCInstance = await DevUSDC.deployed();

      let staked = await deployedPoolStakingRewards.getCurrentBalance(accounts[0]);

      await deployedPoolStakingRewards.unstakeForWallet(accounts[0], staked);

      await devUSDCInstance.approve(
        deployedPoolCore.address,
        new BN('1000000000000'),
        { from: accounts[1] }
      );
      await deployedPoolCore.lendPool(10000000, 10000000, { from: accounts[1] });
      await deployedPoolCore.boost(10000000, 1, false, { from: accounts[1] });

      // forward time past the beginning of the second epoch (roughly)
      // because rewards aren't paid until the end of the epoch
      await increaseTo(
        epochStart.add(epochDuration.add(epochDuration.div(new BN('10'))))
      );

      let currentEpoch = await deployedPoolStakingRewards.getCurrentEpoch();
      assert.equal(currentEpoch.toString(), '2', 'Should be in epoch 2');

      let rewards = await deployedPoolStakingRewards.massHarvest.call(accounts[1]);

      assert.equal(
        rewards.toString(),
        rewardPerEpoch.toString(),
        'Only staked account should earn all the bacon for epoch 1'
      );
    } finally {
      await startSnapshot.restore();
    }
  });

  it('should earn half of epoch bacon if there is another investor', async () => {
    let startSnapshot = await snapshot();
    try {
      const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
      const deployedPoolStaking = await PoolStaking.deployed();
      const epochStart = await deployedPoolStakingRewards.epochStart();
      const epochDuration = await deployedPoolStakingRewards.epochDuration();
      const rewardPerEpoch =
        await deployedPoolStakingRewards.getRewardPerEpoch();

      const deployedPoolCore = await PoolCore.deployed();
      const devUSDCInstance = await DevUSDC.deployed();

      await devUSDCInstance.approve(deployedPoolCore.address, 1000000000000, {
        from: accounts[1],
      });
      await deployedPoolCore.lendPool(10000000, 10000000, { from: accounts[1] });
      await deployedPoolCore.boost(10000000, 1, false,{ from: accounts[1] });

      await devUSDCInstance.transfer(accounts[2], 20000000, {
        from: accounts[0],
      });
      await devUSDCInstance.approve(deployedPoolCore.address, 1000000000000, {
        from: accounts[2],
      });
      await deployedPoolCore.lendPool(10000000, 10000000, { from: accounts[2] });
      await deployedPoolCore.boost(10000000, 1, false,{ from: accounts[2] });

      // If run on its own, this test needs to clear out the stakes for other accounts
      for (let i = 0; i < 10; i++) {
        if (i === 1 || i === 2) {
          continue;
        }
        let staked = await deployedPoolStakingRewards.getCurrentBalance(accounts[i]);
        if (!staked.isZero()) {
          console.log('unstaking ' + staked + ' from account ' + i);
          await deployedPoolStakingRewards.unstakeForWallet(staked, { from: accounts[i] });
        }
      }

      // forward time past the beginning of the second epoch (roughly)
      // because rewards aren't paid until the end of the epoch
      await increaseTo(
        epochStart.add(epochDuration.add(epochDuration.div(new BN('10'))))
      );

      let currentEpoch = await deployedPoolStakingRewards.getCurrentEpoch();
      assert.equal(currentEpoch.toString(), '2', 'Should be in epoch 2');

      let rewards = await deployedPoolStakingRewards.massHarvest.call(accounts[1]);

      assert.equal(
        rewards.toString(),
        rewardPerEpoch.div(new BN('2')).toString(),
        'Account 1 should earn half the rewards from epoch 1'
      );
    } finally {
      await startSnapshot.restore();
    }
  });

  it('should get no epoch bacon if unstaked', async () => {
    let startSnapshot = await snapshot();
    try {
      const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
      const epochStart = await deployedPoolStakingRewards.epochStart();
      const epochDuration = await deployedPoolStakingRewards.epochDuration();

      const deployedPoolCore = await PoolCore.deployed();
      const devUSDCInstance = await DevUSDC.deployed();

      await devUSDCInstance.approve(deployedPoolCore.address, 1000000000000, {
        from: accounts[1],
      });
      await deployedPoolCore.lendPool(10000000, 10000000, { from: accounts[1] });
      await deployedPoolCore.boost(10000000, 1, false, { from: accounts[1] });

      // forward time past the beginning of the first epoch (roughly)
      // because rewards aren't paid until the end of the epoch
      await increaseTo(epochStart.add(epochDuration.div(new BN('2'))));

      let currentEpoch = await deployedPoolStakingRewards.getCurrentEpoch();
      assert.equal(currentEpoch.toString(), '1', 'Should be in epoch 1');

      await deployedPoolStakingRewards.approvePool(accounts[1], {from: accounts[0]});
      await deployedPoolStakingRewards.unstakeForWallet(accounts[1], 5000000, { from: accounts[1] });

      await increase(epochDuration);

      currentEpoch = await deployedPoolStakingRewards.getCurrentEpoch();
      assert.equal(currentEpoch.toString(), '2', 'Should be in epoch 2');

      let rewards = await deployedPoolStakingRewards.massHarvest.call(accounts[1]);

      assert.equal(
        rewards.toString(),
        '0',
        'Should have no rewards because of unstake'
      );
    } finally {
      await startSnapshot.restore();
    }
  });

  it('Bacon decay', async () => {
    let startSnapshot = await snapshot();
    try {
      const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
      const devUSDCInstance = await DevUSDC.deployed();
      const deployedPoolCore = await PoolCore.deployed();
      const deployedStaking = await Staking.deployed();
      const epochStart = await deployedPoolStakingRewards.epochStart();
      const epochDuration = await deployedPoolStakingRewards.epochDuration();

      await deployedPoolStakingRewards.setPerEpoch(new BN('4807692000000000000000000'), {'from': accounts[0]});
      const rewards = await deployedPoolStakingRewards.getRewardPerEpoch.call();
      var bacon;

      for (var i = 0; i < 2000; i++) {
          bacon = await deployedPoolStakingRewards.getRewardAtEpoch.call(i);
          assert.equal(rewards.toString(), bacon.toString(), `Epoch at ${i} is wrong`);

      }
      for (var i = 2000; i < 2052; i++) {
          var newBacon = await deployedPoolStakingRewards.getRewardAtEpoch.call(i);
          assert(newBacon.lt(bacon), `Epoch at ${i} is wrong: ${bacon.toString()} >= ${newBacon.toString()}`);
          bacon = newBacon;
      }
/*
 * This part is really slow. Only run locally.
 *
      await increaseTo(
          epochStart.add(epochDuration.mul(new BN(1979)))
      );

      await deployedStaking.manualBatchEpochInit([deployedPoolCore.address], 2, 99);
      await deployedPoolStakingRewards.massHarvest(accounts[1]);
      for (var i = 100; i < 1900; i += 200) {
          console.log(i);
          await deployedStaking.manualBatchEpochInit([deployedPoolCore.address], i, i + 199);
          await deployedPoolStakingRewards.massHarvest(accounts[1]);

      }
      await deployedStaking.manualBatchEpochInit([deployedPoolCore.address], 1900, 1980);
      await deployedPoolStakingRewards.massHarvest(accounts[1]);

      console.log('INIT OVER');
        
      await devUSDCInstance.approve(
        deployedPoolCore.address,
        new BN('1000000000000'),
        { from: accounts[1] }
      );
      await deployedPoolCore.lendAndStake(10000000, { from: accounts[1] });

      for (var i = 1980; i < 2000; i++) {
          console.log()
          await increaseTo(
              epochStart.add(epochDuration.mul(new BN(i)))
          );
          console.log('REG', i);
          bacon = await deployedPoolStakingRewards.massHarvest.call(accounts[1]);
          await deployedPoolStakingRewards.massHarvest(accounts[1]);
          assert.equal(rewards.toString(), bacon.toString(), `Epoch at ${i} is wrong`);
      }

      const rewardNum = rewards.div(new BN('2000000000000000000')).toNumber();
      for (var i = 2000; i < 2052; i++) {
          await increaseTo(
              epochStart.add(epochDuration.mul(new BN(i)))
          );
          console.log('DECAY', i);
          var newBacon = await deployedPoolStakingRewards.massHarvest.call(accounts[1]);
          await deployedPoolStakingRewards.massHarvest(accounts[1]);
          // console.log("BACON", bacon.toString(), newBacon.toString());
          assert(newBacon.lt(bacon), `Epoch at ${i} is wrong: ${bacon.toString()} >= ${newBacon.toString()}`);
          bacon = newBacon;
      }
 */
    } finally {
      await startSnapshot.restore();
    }
  }).timeout(1000*60*60);


  // TODO: only here to test `endOnePercent` can go away in the next version of the contract
  // it('should stop earning 1% for stake', async () => {
  //   let startSnapshot = await snapshot();
  //   try {
  //     const deployedUSDC = await DevUSDC.deployed();
  //     const deployedTimelock = await Timelock.deployed();
  //     const deployedPool = await PoolCore.deployed();
  //     const deployedStaking = await Staking.deployed();
  //     const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
  //     const epochStart = await deployedPoolStakingRewards.epochStart();
  //     const epochDuration = await deployedPoolStakingRewards.epochDuration();

  //     deployedPool.transfer(deployedTimelock.address, 5_000000, {
  //       from: accounts[0],
  //     });

  //     // Stake some home so that it's in the staking contract. Since the current code has 1% turned off, this should earn no Home
  //     await deployedUSDC.approve(deployedPool.address, 1000000000000, {
  //       from: accounts[1],
  //     });
  //     await deployedPool.lendPool(10000000, 10000000, { from: accounts[1] });
  //     await deployedPool.stake(10000000, { from: accounts[1] });

  //     // Force the staking contract to set data for accumulation of Home and have it earn some home
  //     await deployedStaking.testOnePercent(deployedPool.address, accounts[1], {
  //       from: accounts[0],
  //     });

  //     await increaseTo(epochStart.add(epochDuration.div(new BN('2'))));

  //     // call the end 1% function and make sure that the data is gone and the account no longer earns 1%
  //     const beforeRewards = await deployedPool.claimRewards.call({
  //       from: accounts[1],
  //     });

  //     // New code is in place so rewards from staking should be 0
  //     assert.equal(beforeRewards, 0);

  //     await deployedStaking.endOnePercent([accounts[1]], deployedPool.address, {
  //       from: accounts[0],
  //     });

  //     const afterRewards = await deployedPool.claimRewards.call({
  //       from: accounts[1],
  //     });

  //     // After we have ended the 1%, new code should see the remaining reward.
  //     assert.notEqual(afterRewards, 0);
  //   } finally {
  //     startSnapshot.restore();
  //   }
  // });
});
