const { BN } = require('@openzeppelin/test-helpers');
const { increaseTo, increase } = require('@openzeppelin/test-helpers/src/time');

const PoolCore = artifacts.require('./PoolCore/Pool16.sol');
const PoolStakingRewards = artifacts.require('./PoolStakingRewards/PoolStakingRewards7.sol');
const DevUSDC = artifacts.require('./DevUSDC.sol');
const Timelock = artifacts.require('./Governance/Timelock.sol');
const PropToken = artifacts.require('./PropTokens/PropToken0.sol');
const TestRewards = artifacts.require('./TestRewards/TestRewards0.sol');

const snapshot = require("@openzeppelin/test-helpers/src/snapshot");
const { latestBlock, latest, advanceBlockTo } = require("@openzeppelin/test-helpers/src/time")
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require("chai");

//NOTE: All TXs on a blockchain are ordered, so the order of the tests matters

contract('PoolCore', (accounts) => {
  it('should have a supplyable token address', () =>
    PoolCore.deployed()
      .then((instance) => instance.getSupplyableTokenAddress())
      .then((address) => {
        assert.isNotNull(address, 'ERC20 Token Address is assigned');
      }));

  it('should have 50.01 bHOME in the first account after deploys', async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const balance = await poolCoreInstance.balanceOf(accounts[0]);

    //set value toString because it is BigNumber
    assert.equal(
      balance.valueOf().toString(),
      '50010000',
      "50.01 bHOME wasn't in the first account"
    );
  });

  it('burns initial difference between totalSupply and poolLent', async function () {
    const poolCoreInstance = await PoolCore.deployed();

    await poolCoreInstance.burn(10000);
  });

  it('Lends tokens and redeems them', async function () {
    var poolCoreInstance = await PoolCore.deployed();
    const devUSDCInstance = await DevUSDC.deployed();

    let startSnapshot = await snapshot();
    try {
      await devUSDCInstance.approve(poolCoreInstance.address, 1000000, {
        from: accounts[0],
      });
      await poolCoreInstance.lendPool(1000000, 1000000, { from: accounts[0] });

      const balance = await poolCoreInstance.balanceOf(accounts[0]);
      assert.equal(
        balance.valueOf().toString(),
        '51000000',
        `51.00 HOME wasn't in the first account (${balance.valueOf().toString()})`
      );

      // Redeem a few
      await poolCoreInstance.redeemPool(100000, 100000, { from: accounts[0] });
      assert.equal(
        (await poolCoreInstance.balanceOf(accounts[0])).valueOf().toString(),
        '50900000',
        "50.90 HOME wasn't in the first account"
      );

      // Redeem some more
      await poolCoreInstance.redeemPool(100000, 100000, { from: accounts[0] });
      assert.equal(
        (await poolCoreInstance.balanceOf(accounts[0])).valueOf().toString(),
        '50800000',
        "50.80 HOME wasn't in the first account"
      );

      // Redeem them all
      await poolCoreInstance.redeemPool(50800000, 50800000, { from: accounts[0] });
      assert.equal(
        (await poolCoreInstance.balanceOf(accounts[0])).valueOf().toString(),
        '0',
        "0 HOME wasn't in the first account"
      );

      // Make sure we can lend after redeem
      await devUSDCInstance.approve(poolCoreInstance.address, 51000000, {
        from: accounts[0],
      });
      await poolCoreInstance.lendPool(51000000, 51000000, { from: accounts[0] });
      assert.equal(
        (await poolCoreInstance.balanceOf(accounts[0])).valueOf().toString(),
        '51000000',
        "51.00 HOME wasn't in the first account"
      );
    } finally {
      await startSnapshot.restore();
    }
  });


  it('Finalize and end calc', async () => {
    const poolCoreInstance = await PoolCore.deployed();
    const balance = await poolCoreInstance.balanceOf(accounts[0]);

    let startSnapshot = await snapshot();
    try {

      var initBalances = [];
      for (var i = 0; i < accounts.length; i++) {
        const bal = await poolCoreInstance.balanceOf(accounts[i]);
        initBalances.push(bal);
      }

      await poolCoreInstance.endOnePercent(accounts);

      for (var i = 0; i < accounts.length; i++) {
         const curBal = (await poolCoreInstance.balanceOf(accounts[i])).toNumber();
         if (initBalances[i].toNumber() == 0) continue;
         assert.isAbove(curBal, initBalances[i].toNumber());
      }
      
    } finally {
      await startSnapshot.restore();
    }
  });



});
