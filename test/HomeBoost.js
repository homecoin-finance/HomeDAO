const {
  increaseTo,
  latest,
  increase,
} = require('@openzeppelin/test-helpers/src/time');
const snapshot = require('@openzeppelin/test-helpers/src/snapshot');
const { assert } = require('chai');

const Staking = artifacts.require('./Staking/Staking3.sol');
const PoolCore = artifacts.require('./PoolCore/Pool14.sol');
const DevUSDC = artifacts.require('./DevUSDC.sol');
const PropToken = artifacts.require('./PropTokens/PropToken0.sol');
const Timelock = artifacts.require('./Governance/Timelock.sol');
const PoolStakingRewards = artifacts.require(
  './PoolStakingRewards/PoolStakingRewards0.sol'
);
const HomeBoost = artifacts.require('./HomeBoost/HomeBoost4.sol');

const BN = web3.utils.BN;

const bnRoughEqual = (lhs, rhs, options) => {
  if (!options) {
    options = { delta: '2' };
  }
  const { delta } = options;

  return lhs.gte(rhs) && lhs.lte(rhs.add(new BN(delta)));
};

contract('HomeBoost', (accounts) => {
  let startSnapshot = null;
  // TODO: for some reason this can't be 'beforeAll'?
  beforeEach(async () => {
    startSnapshot = await snapshot();
  });

  it('Boost1: should mint on boost', async () => {
    const devUSDCInstance = await DevUSDC.deployed();
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();

    const boostAmount = new BN('10000000');

    // transfer enough Home for the boost to work
    const usdcBalance = await devUSDCInstance.balanceOf(accounts[0]);
    console.log('usdc balance ' + usdcBalance);

    await devUSDCInstance.transfer(accounts[0], boostAmount, {
      from: accounts[1],
    });

    await devUSDCInstance.approve(poolCoreInstance.address, boostAmount, {
      from: accounts[0],
    });

    await poolCoreInstance.lendPool(boostAmount, boostAmount, { from: accounts[0] });

    const zerosBalance = await poolCoreInstance.balanceOf(accounts[0]);
    console.log('balance ' + zerosBalance);

    // await poolCoreInstance.boost(boostAmount, 1, false, {
    //   from: accounts[0],
    // });

    await debug(
      poolCoreInstance.boost(boostAmount, 1, false, {
        from: accounts[0],
      })
    );

    const boostBalance = await homeBoostInstance.balanceOf(accounts[0]);

    assert.equal(boostBalance, 1, 'Boost should have minted a HomeBoost token');

    const zerosBalanceAfter = await poolCoreInstance.balanceOf(accounts[0]);
    assert.isTrue(
      zerosBalance > zerosBalanceAfter,
      'Account that boosted should have less Home'
    );

    const details = await homeBoostInstance.getTokens();
  });

  it('Boost2: should be claimable after first iteration with autorenew', async () => {
    var poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const devUSDCInstance = await DevUSDC.deployed();

    const balanceBefore = await devUSDCInstance.balanceOf(accounts[0]);

    await devUSDCInstance.approve(poolCoreInstance.address, new BN('100000000'), {
      from: accounts[0],
    });

    await poolCoreInstance.lendPool(new BN('100000000'), new BN('100000000'), {from: accounts[0]});
    await poolCoreInstance.boost(new BN('100000000'), 1, true, {
      from: accounts[0],
    });

    const balanceAfter = await devUSDCInstance.balanceOf(accounts[0]);
    assert.equal(
      balanceBefore.toString(),
      balanceAfter.add(new BN('100000000')).toString(),
      'lend and boost should have moved USDC from the account'
    );

    // should not be claimable
    let details = await homeBoostInstance.getTokens();
    assert.isFalse(details[0].isComplete);
    assert.strictEqual(details[0].totalRewards, '0');

    // jump time to after first iteration
    await increaseTo(new BN(details[0].nextRewardTimestamp).add(new BN('1')));

    // should be claimable
    details = await homeBoostInstance.getTokens();
    assert.isTrue(new BN(details[0].totalRewards) > new BN('1'));
  });

  it('Boost3: should be claimable after first iteration without autorenew', async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();

    await poolCoreInstance.boost(new BN('10000000'), 1, false, {
      from: accounts[0],
    });

    // should not be claimable
    let details = await homeBoostInstance.getTokens();
    assert.isFalse(details[0].isComplete);
    assert.strictEqual(details[0].totalRewards, '0');

    // jump time to after first iteration
    await increaseTo(new BN(details[0].nextRewardTimestamp).add(new BN('1')));

    // should be claimable
    details = await homeBoostInstance.getTokens();
    assert.isTrue(details[0].isComplete);
    assert.isTrue(new BN(details[0].totalRewards) > new BN('1'));
  });

  it('Boost4: should transfer reward on claimPrincipal', async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const daoInstance = await Timelock.deployed();

    await poolCoreInstance.transfer(accounts[1], new BN('10000000'), {
      from: accounts[0],
    });

    // Make sure the timelock (dao) has some Home in it, because that is where the rewards come from
    await poolCoreInstance.transfer(daoInstance.address, new BN('10000000'), {
      from: accounts[0],
    });

    const previousBalance = await poolCoreInstance.balanceOf(accounts[1]);

    await poolCoreInstance.boost(new BN('10000000'), 1, false, {
      from: accounts[1],
    });

    const balanceAfterBoost = await poolCoreInstance.balanceOf(accounts[1]);

    // should not be claimable
    try {
      await homeBoostInstance.claimPrincipal(1, { from: accounts[1] });
      throw null;
    } catch (error) {
      // console.log(error.message)
      assert(error, "Expecting error but didn't get one");
      // One of these errors works when running the test file individually and one works when running the whole test suite.
      // Truffle is awesome :/
      // console.log(error.message);
      assert(
        error.message.includes('Still locked'),
        "Expected revert because we haven't passed the first iteration"
      );
    }
    let details = await homeBoostInstance.getTokens({ from: accounts[1] });

    // jump time to after first iteration
    await increaseTo(new BN(details[0].nextRewardTimestamp).add(new BN('10')));

    await homeBoostInstance.claimPrincipal(1, { from: accounts[1] });

    const zerosBalance = await poolCoreInstance.balanceOf(accounts[1]);
    assert.isTrue(new BN(zerosBalance).gt(new BN(balanceAfterBoost)));

    details = await homeBoostInstance.getTokens();
    assert.isTrue(details.length == 0, 'should have no boosts');
  });

  it("Boost5: USDC of boosted HOME shouldn't be redeemable", async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const devUSDCInstance = await DevUSDC.deployed();
    const propTokenInstance = await PropToken.deployed();
    const stakingInstance = await Staking.deployed();
    const servicerAddress = accounts[0];

    let ALOT_OF_USDC = 150_000000;
    let SOME_OF_USDC = 100_000000;

    await devUSDCInstance.approve(poolCoreInstance.address, SOME_OF_USDC, {
      from: accounts[0],
    });
    await poolCoreInstance.lendPool(SOME_OF_USDC, SOME_OF_USDC, { from: accounts[0] });

    await propTokenInstance.approve(poolCoreInstance.address, 0),
      { from: poolCoreInstance.address };

    await poolCoreInstance.borrow(ALOT_OF_USDC, 100_000000, 0, {
      from: servicerAddress,
    });

    // Can redeem from new money in
    await devUSDCInstance.transfer(accounts[1], SOME_OF_USDC, {
      from: accounts[0],
    });
    await devUSDCInstance.approve(poolCoreInstance.address, ALOT_OF_USDC, {
      from: accounts[1],
    });
    await poolCoreInstance.lendPool(ALOT_OF_USDC, ALOT_OF_USDC, { from: accounts[1] });

    await poolCoreInstance.redeemPool(SOME_OF_USDC, SOME_OF_USDC, { from: accounts[0] });

    // Lend it back and try to redeem after a boost
    await devUSDCInstance.approve(poolCoreInstance.address, SOME_OF_USDC, {
      from: accounts[0],
    });
    await poolCoreInstance.lendPool(SOME_OF_USDC, SOME_OF_USDC, { from: accounts[0] });

    await poolCoreInstance.boost(ALOT_OF_USDC, 1, true, {
      from: accounts[1],
    });

    // Should pass
    await poolCoreInstance.redeemPool(ALOT_OF_USDC, ALOT_OF_USDC, { from: accounts[0] });

    try {
      // Should fail for not enough unlocked USDC
      await poolCoreInstance.redeemPool(new BN('76000000000000000000000'), 760000, { from: accounts[0] });
      throw null;
    } catch (error) {
      // console.log(error.message)
      assert(error, "Expecting error but didn't get one");
    }
  });

  it('Boost7: should transfer reward on claimPrincipal level 2', async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const daoInstance = await Timelock.deployed();

    const latest_num = await latest();
    await homeBoostInstance.setWeeklyStartTime(latest_num, {
      from: accounts[0],
    });
    for (var i = 0; i < 371; i += 7) {
      await homeBoostInstance.appendInterestRate(new BN('5000'), {
        from: accounts[0],
      });
    }
    await poolCoreInstance.transfer(accounts[1], new BN('10000000'), {
      from: accounts[0],
    });

    // Make sure the timelock (dao) has some Home in it, because that is where the rewards come from
    await poolCoreInstance.transfer(daoInstance.address, new BN('10000000'), {
      from: accounts[0],
    });

    const previousBalance = await poolCoreInstance.balanceOf(accounts[1]);

    await poolCoreInstance.boost(new BN('10000000'), 2, false, {
      from: accounts[1],
    });

    const balanceAfterBoost = await poolCoreInstance.balanceOf(accounts[1]);

    // should not be claimable
    try {
      await homeBoostInstance.claimPrincipal(1, { from: accounts[1] });
      throw null;
    } catch (error) {
      // console.log(error.message)
      assert(error, "Expecting error but didn't get one");
      // One of these errors works when running the test file individually and one works when running the whole test suite.
      // Truffle is awesome :/
      console.log(error.message);
      assert(
        error.message.includes('Still locked'),
        "Expected revert because we haven't passed the first iteration"
      );
    }
    let details = await homeBoostInstance.getTokens({ from: accounts[1] });

    // jump time to after first iteration
    await increaseTo(new BN(details[0].nextRewardTimestamp).add(new BN('1')));

    const claimed = await homeBoostInstance.claimPrincipal(1, {
      from: accounts[1],
    });

    const zerosBalance = await poolCoreInstance.balanceOf(accounts[1]);
    console.log(
      'Values!',
      new BN(zerosBalance).toString(),
      new BN(balanceAfterBoost).toString()
    );
    assert.isTrue(new BN(zerosBalance).eq(new BN('10050000')));

    // should be claimable
    details = await homeBoostInstance.getTokens();
    assert.isTrue(details.length == 0, 'should have no boosts');
  });

  it('Boost8: test interest', async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const daoInstance = await Timelock.deployed();

    var val;
    const zero = new BN('0');

    // If we haven't pushed onto weeklyInterestRates, always 0
    val = await homeBoostInstance.getPerYearRateForLevel2(0, 1);
    assert.isTrue(BN(val).eq(zero));
    console.log(val);

    await homeBoostInstance.setWeeklyStartTime(new BN('0'), {
      from: accounts[0],
    });
    await homeBoostInstance.appendInterestRate(new BN('7000'), {
      from: accounts[0],
    });
    val = await homeBoostInstance.getPerYearRateForLevel2(0, 0);
    console.log(new BN(val).toString());
    assert.isTrue(new BN(val).eq(zero));

    val = await homeBoostInstance.getPerYearRateForLevel2(0, 86400 * 365 * 135);
    console.log(new BN(val).toString());
    assert.isTrue(new BN(val).eq(new BN('000000994419076610'))); // a very small number

    val = await homeBoostInstance.getPerYearRateForLevel2(1, 86401);
    console.log(new BN(val).toString());
    assert.isTrue(new BN(val).eq(new BN('7000081018518518')));

    val = await homeBoostInstance.getPerYearRateForLevel2(0, 86400 * 6);
    console.log(new BN(val).toString());
    assert.isTrue(BN(val).eq(new BN('7000000000000000')));
    await homeBoostInstance.appendInterestRate(new BN('1000'), {
      from: accounts[0],
    });
    await homeBoostInstance.appendInterestRate(new BN('1000'), {
      from: accounts[0],
    });

    val = await homeBoostInstance.getPerYearRateForLevel2(0, 86400 * 7);
    console.log(new BN(val).toString());
    assert.isTrue(new BN(val).eq(new BN('7000000000000000')));

    val = await homeBoostInstance.getPerYearRateForLevel2(86400, 86400 * 16);
    console.log(new BN(val).toString());
    assert.isTrue(new BN(val).eq(new BN('3400000000000000')));
  });

  it('Boost9: test interest rate view', async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const daoInstance = await Timelock.deployed();

    var val;
    val = await homeBoostInstance.getAPYForLevel(1);
    console.log(new BN(val).toString());
    assert.isTrue(val.eq(new BN('20000')));

    val = await homeBoostInstance.getAPYForLevel(2);
    console.log(new BN(val).toString());
    assert.isTrue(val.eq(new BN('0')));

    await homeBoostInstance.appendInterestRate(new BN('1000'), {
      from: accounts[0],
    });

    val = await homeBoostInstance.getAPYForLevel(2);
    console.log(new BN(val).toString());
    assert.isTrue(val.eq(new BN('1000')));
  });

  // Test that boosted Home does not accumulate 1% in Home rewards.
  it('Boost10: should not accumulate 1% rewards on boosted home', async () => {
    const timelockInstance = await Timelock.deployed();
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const devUSDCInstance = await DevUSDC.deployed();

    // Rewards must be distributed to Timelock first to have rewards available to claim
    await poolCoreInstance.transfer(timelockInstance.address, 10_000000, {
      from: accounts[0],
    });

    // claim all the rewards currently available.
    await poolCoreInstance.claimRewards({ from: accounts[0] });

    const homeBalance = await poolCoreInstance.balanceOf(accounts[0]);

    await poolCoreInstance.transfer(accounts[1], homeBalance, {
      from: accounts[0],
    });

    await poolCoreInstance.claimRewards({ from: accounts[0] });

    const afterHomeBalance = await poolCoreInstance.balanceOf(accounts[0]);

    assert.equal(afterHomeBalance, 0);

    await devUSDCInstance.approve(poolCoreInstance.address, new BN('100000000'), {
      from: accounts[0],
    });

    await poolCoreInstance.lendPool(new BN('100000000'), new BN('100000000'), {
      from: accounts[0],
    });

    await poolCoreInstance.boost(new BN('100000000'), 1, true, {
      from: accounts[0],
    });

    let details = await homeBoostInstance.getTokens();

    // jump time to after first iteration
    await increaseTo(new BN(details[0].nextRewardTimestamp).add(new BN('1')));

    // There should be no 1% rewards to claim for account[0]
    const afterTimeJumpBalance = await poolCoreInstance.claimRewards.call({
      from: accounts[0],
    });

    assert.equal(afterTimeJumpBalance, 0);
  });

  // Test that bacon rewards transfer when Boost token is transferred.
  // Test that boosted Home does not accumulate 1% in Home rewards.
  it('Boost11: should transfer Bacon rewards when Boost transfers', async () => {
    const timelockInstance = await Timelock.deployed();
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const poolStakingRewardsInstance = await PoolStakingRewards.deployed();

    const epochStart = await poolStakingRewardsInstance.epochStart();
    const epochDuration = await poolStakingRewardsInstance.epochDuration();

    // Rewards must be distributed to Timelock first to have rewards available to claim
    await poolCoreInstance.transfer(timelockInstance.address, 5_000000, {
      from: accounts[0],
    });

    // send some home to 3
    await poolCoreInstance.transfer(accounts[3], 5_000000, {
      from: accounts[0],
    });
    // boost the home on 3
    await poolCoreInstance.boost(5_000000, 1, false, {
      from: accounts[3],
    });
    // make sure 4 has nothing staked.
    const preStaked = await poolStakingRewardsInstance.getCurrentBalance(accounts[4]);

    assert.equal(preStaked, 0);
    // transfer the boost to 4
    let details = await homeBoostInstance.getTokens({ from: accounts[3] });
    await homeBoostInstance.transferFrom(
      accounts[3],
      accounts[4],
      details[0].id,
      { from: accounts[3] }
    );

    // jump time to after first epoch
    await increaseTo(
      epochStart.add(epochDuration.add(epochDuration.div(new BN('10'))))
    );

    // claim bacon rewards on 4
    const baconRewards = await poolStakingRewardsInstance.massHarvest.call(
      accounts[4],
      {
        from: accounts[4],
      }
    );

    const otherRewards = await poolStakingRewardsInstance.massHarvest.call(
      accounts[3],
      { from: accounts[3] }
    );

    console.log('OTHER REWARDS:' + otherRewards);
    assert.equal(otherRewards.toString(), '0');

    // bacon earned should be > 0
    assert.notEqual(baconRewards.toString(), '0');
  });

  it('Boost12: l1 should be claimable half way through second iteration with autorenew', async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const devUSDCInstance = await DevUSDC.deployed();

    boostAmount = new BN('10000000000');
    devUSDCInstance.transfer(accounts[2], boostAmount, {
      from: accounts[0],
    });

    await devUSDCInstance.approve(poolCoreInstance.address, boostAmount, {
      from: accounts[2],
    });
    const balanceBefore = await devUSDCInstance.balanceOf(accounts[2]);

    await devUSDCInstance.approve(poolCoreInstance.address, boostAmount, {
      from: accounts[2],
    });

    await poolCoreInstance.lendPool(boostAmount, boostAmount, {from: accounts[2]});
    await poolCoreInstance.boost(boostAmount, 1, true, {
      from: accounts[2],
    });

    const balanceAfter = await devUSDCInstance.balanceOf(accounts[2]);
    assert.equal(
      balanceBefore.toString(),
      balanceAfter.add(boostAmount).toString(),
      'lend and boost should have moved USDC from the account'
    );

    // should not be claimable
    let details = await homeBoostInstance.getTokens({ from: accounts[2] });
    assert.isFalse(details[0].isComplete);
    assert.strictEqual(details[0].totalRewards, '0');

    const secondsPerDay = 86400;
    const halfIteration = secondsPerDay * 45;

    // jump time to half way through the first iteration
    await increaseTo(
      new BN(details[0].nextRewardTimestamp).sub(new BN(halfIteration))
    );

    // half rewards should be claimable
    details = await homeBoostInstance.getTokens({ from: accounts[2] });
    console.log('rewards: ' + details[0].totalRewards);
    assert.closeTo(new BN(details[0].totalRewards).toNumber(), 24657534, 10);

    // jump time to half way through the second iteration
    await increaseTo(
      new BN(details[0].nextRewardTimestamp).add(new BN(halfIteration))
    );

    // 1.5 rewards should be claimable
    details = await homeBoostInstance.getTokens({ from: accounts[2] });
    console.log('rewards: ' + details[0].totalRewards);
    assert.isTrue(
      bnRoughEqual(new BN(details[0].totalRewards), new BN('73972602'))
    );

    // end the boost
    await homeBoostInstance.endAutoRenew(details[0].id, { from: accounts[2] });

    const justOver2Iters = new BN(details[0].nextRewardTimestamp).add(
      new BN('1')
    );
    await increaseTo(justOver2Iters);

    let timeAfterIncrease = await latest();
    console.log('jumped to ' + justOver2Iters + ' got ' + timeAfterIncrease);

    // 2 iterations of rewards should be claimable
    details = await homeBoostInstance.getTokens({ from: accounts[2] });
    console.log('rewards3: ' + details[0].totalRewards);
    // 2 iterations of rewards plus 1 second of 1% rewards
    assert.isTrue(
      bnRoughEqual(new BN(details[0].totalRewards), new BN('98630140'), {
        delta: '6',
      })
    );
  });

  it('Boost13: l2 should be claimable half way through second iteration with autorenew', async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const homeBoostInstance = await HomeBoost.deployed();
    const devUSDCInstance = await DevUSDC.deployed();

    // Set up l2 boosts for 0.5% interest over 2 years
    const latest_num = await latest();
    await homeBoostInstance.setWeeklyStartTime(latest_num, {
      from: accounts[0],
    });
    for (var i = 0; i < 735; i += 7) {
      await homeBoostInstance.appendInterestRate(new BN('5000'), {
        from: accounts[0],
      });
    }

    boostAmount = new BN('10000000000');
    devUSDCInstance.transfer(accounts[2], boostAmount, {
      from: accounts[0],
    });

    await devUSDCInstance.approve(poolCoreInstance.address, boostAmount, {
      from: accounts[2],
    });
    const balanceBefore = await devUSDCInstance.balanceOf(accounts[2]);

    await devUSDCInstance.approve(poolCoreInstance.address, boostAmount, {
      from: accounts[2],
    });

    await poolCoreInstance.lendPool(boostAmount, boostAmount, {from: accounts[2]});
    await poolCoreInstance.boost(boostAmount, 2, true, {
      from: accounts[2],
    });

    const balanceAfter = await devUSDCInstance.balanceOf(accounts[2]);
    assert.equal(
      balanceBefore.toString(),
      balanceAfter.add(boostAmount).toString(),
      'lend and boost should have moved USDC from the account'
    );

    // should not be claimable
    let details = await homeBoostInstance.getTokens({ from: accounts[2] });
    assert.isFalse(details[0].isComplete);
    assert.strictEqual(details[0].totalRewards, '0');

    const secondsPerDay = 86400;
    const halfIteration = (secondsPerDay * 365) / 2;

    // jump time to half way through the first iteration
    await increaseTo(
      new BN(details[0].nextRewardTimestamp).sub(new BN(halfIteration))
    );

    // half rewards should be claimable
    details = await homeBoostInstance.getTokens({ from: accounts[2] });
    console.log('rewards1: ' + details[0].totalRewards);
    assert.closeTo(new BN(details[0].totalRewards).toNumber(), 25000000, 100);

    // jump time to half way through the second iteration
    const oneAndHalfTime = new BN(details[0].nextRewardTimestamp).add(
      new BN(halfIteration)
    );
    await increaseTo(oneAndHalfTime);

    let timeAfterIncrease = await latest();
    console.log('jumped to ' + oneAndHalfTime + ' got ' + timeAfterIncrease);

    // 1.5 rewards should be claimable
    details = await homeBoostInstance.getTokens({ from: accounts[2] });
    console.log('rewards2: ' + details[0].totalRewards);
    assert.closeTo(new BN(details[0].totalRewards).toNumber(), 75000000, 10);

    // end the boost
    await homeBoostInstance.endAutoRenew(details[0].id, { from: accounts[2] });

    const justOver2Iters = new BN(details[0].nextRewardTimestamp).add(
      new BN('1')
    );
    await increaseTo(justOver2Iters);

    timeAfterIncrease = await latest();
    console.log('jumped to ' + justOver2Iters + ' got ' + timeAfterIncrease);

    // 2 iterations of rewards should be claimable
    details = await homeBoostInstance.getTokens({ from: accounts[2] });
    console.log('rewards3: ' + details[0].totalRewards);
    // 2 iterations of rewards plus 1 second of 1% rewards
    assert.closeTo(new BN(details[0].totalRewards).toNumber(), 100000003, 10);

    const threeYears = new BN(details[0].nextRewardTimestamp).add(
      new BN(secondsPerDay * 365)
    );
    await increaseTo(threeYears);

    timeAfterIncrease = await latest();
    console.log('jumped to ' + threeYears + ' got ' + timeAfterIncrease);

    // total rewards should be 2 iterations plus a full year at 1%
    details = await homeBoostInstance.getTokens({ from: accounts[2] });
    console.log('rewards4: ' + details[0].totalRewards);
    // 2 iterations of rewards plus 1 second of 1% rewards
    assert.closeTo(new BN(details[0].totalRewards).toNumber(), 200000000, 10);
  });

  afterEach(async () => {
    console.log('restoring state');
    startSnapshot.restore();
  });
});
