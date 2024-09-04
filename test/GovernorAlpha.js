const GovernorAlpha = artifacts.require('./Governance/GovernorAlpha.sol');
const BaconCoin = artifacts.require('./BaconCoin/BaconCoin0.sol');

const BN = web3.utils.BN;


contract('GovernorAlpha', (accounts) => {
  it('should match the correct proposalThreshold to .5% of Bacons totalSupply', async () => {
    const baconCoinInstance = await BaconCoin.deployed();
    const baconTotalSupply = await baconCoinInstance.totalSupply.call();

    const governorAlphaInstance = await GovernorAlpha.deployed();
    const proposalThreshold =
      await governorAlphaInstance.proposalThreshold.call();

    assert.equal(
      baconTotalSupply.div(new BN('200')).toString(),
      proposalThreshold,
      "proposal Threshold wasn't .5% of Bacon total supply"
    );
  });

  it('should match the correct quorumVotes to 25% of Bacons totalSupply', async () => {
    const baconCoinInstance = await BaconCoin.deployed();
    const baconTotalSupply = await baconCoinInstance.totalSupply.call();

    const governorAlphaInstance = await GovernorAlpha.deployed();
    const quorumVotes = await governorAlphaInstance.quorumVotes.call();

    assert.equal(
      baconTotalSupply.div(new BN('4')).toString(),
      quorumVotes,
      "quorum for votes wasn't 25% of Bacon total supply"
    );
  });


});
