require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const { upgradeContractFromMultisig } = require('./utils');

const Pool6 = artifacts.require('./PoolCore/Pool6.sol');
// const Reentrancy = artifacts.require('./Reentrancy.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, Pool6);
  if (network === 'development') {
    // uncomment to deploy reentrancy, a contract that attempts a reentrancy attack
    // on a Pool contract that sends it Home
    // const USDCInstance = await DUSDC.deployed();
    // await deployer.deploy(
    //   Reentrancy,
    //   deployedPoolCore4.address,
    //   USDCInstance.address
    // );
    // ReentrancyInstance = await Reentrancy.deployed();
    // console.log(
    //   'Deployed Reentrancy Implementation contract to: ',
    //   ReentrancyInstance.address
    // );
    //Send reentrancy contract some DUSDC to test with
    // await USDCInstance.transfer(ReentrancyInstance.address, 900000000);
    // console.log('Transferred 900 DevUSDC to: ', ReentrancyInstance.address);
    //upgrade pool 4 to 6
    // //attempt reentrancy after
    // await ReentrancyInstance.attemptReentry();
    // let newUSDC = await USDCInstance.balanceOf(ReentrancyInstance.address);
    // console.log("newUSDC balance of reentrancy is: " + newUSDC)
  }
};
