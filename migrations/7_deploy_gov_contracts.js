require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const {
  deployNonUpgradableContract,
  getContractAddress,
  getMultisigAddress,
  callContractMethodFromMultisig,
} = require('./utils');

const Timelock = artifacts.require('./Governance/Timelock.sol');
const GovernorAlpha = artifacts.require('./Governance/GovernorAlpha.sol');
const BaconCoin0 = artifacts.require('./BaconCoin/BaconCoin0.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }
  let loanSnapAddress = getMultisigAddress(network);

  //Deploy Timelock (w LoanSnap as admin)
  await deployNonUpgradableContract(
    deployer,
    Timelock,
    [loanSnapAddress, 0, 0],
    { networkConfigName: 'Timelock' }
  );
  TimelockInstance = await Timelock.deployed();
  console.log('Deployed Timelock to: ', TimelockInstance.address);

  //Deploy GovernorAlpha (w Timelock address)
  const baconCoinAddress = getContractAddress(network, BaconCoin0.contractName);
  await deployNonUpgradableContract(
    deployer,
    GovernorAlpha,
    [TimelockInstance.address, baconCoinAddress, loanSnapAddress],
    { networkConfigName: 'GovernorAlpha' }
  );
  GovernorAlphaInstance = await GovernorAlpha.deployed();
  console.log('Deployed GovernorAlpha to: ', GovernorAlphaInstance.address);

  //Queue and execute "setPendingAdmin(address GovernorAlpha)" on Timelock from LoanSnap
  const deployedTimelock = await Timelock.deployed();
  let block = await web3.eth.getBlock('latest');

  // I think in Ganache block.timestamp has not actually be called before the next block is generated
  // therefore this console.log is required for devnet deploys
  console.log(block.timestamp);
  // For public networks give 60 minutes to get the proposals sent and approved
  const etaTimestamp =
    network === 'development' ? block.timestamp + 1 : block.timestamp + 3600;
  const encoded = await web3.eth.abi.encodeParameter(
    'address',
    GovernorAlphaInstance.address
  );

  await callContractMethodFromMultisig(deployer, Timelock, 'queueTransaction', [
    deployedTimelock.address,
    0,
    'setPendingAdmin(address)',
    encoded,
    etaTimestamp,
  ]);

  if (network === 'development') {
    //wait for timelock eta to pass
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < 1000);
  }

  await callContractMethodFromMultisig(
    deployer,
    Timelock,
    'executeTransaction',
    [
      deployedTimelock.address,
      0,
      'setPendingAdmin(address)',
      encoded,
      etaTimestamp,
    ]
  );

  await callContractMethodFromMultisig(
    deployer,
    GovernorAlpha,
    '__acceptAdmin',
    []
  );
};
