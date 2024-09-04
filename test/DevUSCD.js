const DevUSDC = artifacts.require('./DevUSDC.sol');

contract('DevUSDC', (accounts) => {
  it('should put 989902 DevUSDC in the first account after deploys', async () => {
    const devUSDCInstance = await DevUSDC.deployed();
    const balance = await devUSDCInstance.balanceOf(accounts[0]);

    //set value toString because it is BigNumber
    assert.equal(
      balance.valueOf().toString(),
      '989902000000',
      "989902 wasn't in the first account"
    );
  });
});
