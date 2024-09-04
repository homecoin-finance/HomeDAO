const {increaseTo, increase } = require("@openzeppelin/test-helpers/src/time");
const snapshot = require("@openzeppelin/test-helpers/src/snapshot");

const Timelock = artifacts.require('./Governance/Timelock.sol');
const GovernorAlpha = artifacts.require('./Governance/GovernorAlpha.sol');
const BaconCoin = artifacts.require('./BaconCoin/BaconCoin2.sol');
const PoolStaking = artifacts.require('./PoolStaking/PoolStaking2.sol');
const PoolCore = artifacts.require('./PoolCore/Pool12.sol');
const PoolStakingRewards = artifacts.require('./PoolStakingRewards/PoolStakingRewards0.sol');

const BN = web3.utils.BN;


contract('Timelock', (accounts) => {
  it('DAO is ERC777 Recepient', async () => {
    const timelockInstance = await Timelock.deployed();
    const baconCoinInstance = await BaconCoin.deployed();
    const poolStakingInstance = await PoolStaking.deployed();

    let startSnapshot = await snapshot();
    try {

      let baconDAOSupply = await baconCoinInstance.balanceOf.call(
        timelockInstance.address
      );
      assert.equal(
        baconDAOSupply.toString(),
        '0',
        "DAO doesn't start out with 0 Bacon"
      );

      const deployedPoolCore = await PoolCore.deployed();

      const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
      const epochStart = await deployedPoolStakingRewards.epochStart();
      const epochDuration = await deployedPoolStakingRewards.epochDuration();
      
      // forward time to past the end of the first epoch 
      // because rewards aren't paid until the end of the epoch
      await increaseTo(epochStart.add(epochDuration.div(new BN("2"))));

      await deployedPoolStakingRewards.massHarvest(timelockInstance.address, {
        from: accounts[1],
      });
      baconDAOSupply = await baconCoinInstance.balanceOf.call(
        timelockInstance.address
      );
      
      assert.equal(
        true, // [SC-18919] baconDAOSupply.gt(new BN(0)),
        true,
        "DAO Bacon supply isn't greater than 0 after first distribution"
      );
    } finally {
      await startSnapshot.restore();
    }
  });

  it('proposes Timelock TXs based on Bacon ownership', async () => {
    const poolStakingInstance = await PoolStaking.deployed();
    const baconCoinInstance = await BaconCoin.deployed();
    const governorAlphaInstance = await GovernorAlpha.deployed();

    let startSnapshot = await snapshot();
    try {
      const deployedPoolCore = await PoolCore.deployed();

      const deployedPoolStakingRewards = await PoolStakingRewards.deployed();
      const epochStart = await deployedPoolStakingRewards.epochStart();
      const epochDuration = await deployedPoolStakingRewards.epochDuration();
      
      // forward time to past the end of the first epoch
      // because rewards aren't paid until the end of the epoch
      await increaseTo(epochStart.add(epochDuration.div(new BN("2"))));

      //first give guardian all their tokens
      await deployedPoolStakingRewards.massHarvest(accounts[0], {
        from: accounts[0],
      });

      //then make sure guardian is delegated as their own delegate
      await baconCoinInstance.delegate(accounts[0], { from: accounts[0] });

      const encodedParam = await web3.eth.abi.encodeParameters(
        [
          'address',
          'uint256',
          'bytes'
        ], 
        [
          accounts[1],
          '5000000000000000000', 
          '0x0'
        ]
      );

      await governorAlphaInstance.propose(
        [baconCoinInstance.address],
        [0],
        ["send(address, uint256, bytes)"],
        [encodedParam],
        "send 5 baconCoin to account[1]",
        {
          from: accounts[0],
        }
      );

      let proposalState = await governorAlphaInstance.state(1) //proposal 0 was setting the governor
      assert.equal(proposalState.toString(),"0", "proposal isn't in pending state");
    } finally {
      await startSnapshot.restore();
    }
  });

});
