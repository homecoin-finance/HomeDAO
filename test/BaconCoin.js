const PoolStaking = artifacts.require('./PoolStaking/PoolStaking1.sol');
const BaconCoin = artifacts.require('./BaconCoin/BaconCoin1.sol');
const PoolCore = artifacts.require('./Pools/Pool9.sol');
const DevUSDC = artifacts.require('./DevUSDC.sol');
const Timelock = artifacts.require('./Governance/Timelock.sol');

const BN = web3.utils.BN;

contract('BaconCoin', (accounts) => {

  it('should delegate Bacon voting power to self', async () => {
    const baconCoinInstance = await BaconCoin.deployed();
    await baconCoinInstance.delegate(accounts[0], { from: accounts[0] });

    //set value toString because it is BigNumber
    const votes = await baconCoinInstance.getCurrentVotes(accounts[0]);
    const balance = await baconCoinInstance.balanceOf(accounts[0]);

    assert.equal(
      votes.valueOf().toString(),
      balance.valueOf().toString(),
      "voting power doesn't match balance after delegating self"
    );
  });

  it('should transfer voting power when transferring Bacon', async () => {
    const baconCoinInstance = await BaconCoin.deployed();
    const balance = await baconCoinInstance.balanceOf(accounts[0]);

    await baconCoinInstance.transfer(accounts[1], balance, {
      from: accounts[0],
    });

    const votes = await baconCoinInstance.getCurrentVotes(accounts[0]);
    const balance1 = await baconCoinInstance.balanceOf(accounts[1]);

    assert.equal(
      votes.toString(),
      '0',
      "voting power wasn't removed after Bacon transfer"
    );

    assert.equal(
        balance1.toString(),
        balance.toString(),
        "Bacon transfer was unsuccessful"
      );
  });

});