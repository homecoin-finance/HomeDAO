require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const {
  deployUpgradableContract,
  getContractAddress,
  getMultisigAddress,
  upgradeContractFromMultisig,
  callContractMethodFromMultisig,
} = require('./utils');

const Pool1 = artifacts.require('./Pools/Pool1.sol');
const propToken0 = artifacts.require('./PropTokens/PropToken0.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  const loansnapAddress = getMultisigAddress(network);

  await deployUpgradableContract(
    deployer,
    propToken0,
    [
      'PropToken',
      'Prop',
      getContractAddress(network, Pool1.contractName),
      loansnapAddress,
    ],
    {
      networkConfigName: 'propTokenAddress',
    }
  );

  const propTokenInstance = await propToken0.deployed();
  if (network === 'development') {
    //create sample propToken
    await propTokenInstance.mintPropToken(
      accounts[0],
      250000000000,
      [250000000000, 50000000000],
      750000000000,
      '742 Evergreen Terrace, Springfield USA',
      'https://upload.wikimedia.org/wikipedia/en/c/ca/742_Evergreen_Terrace.png'
    );
  }

  await upgradeContractFromMultisig(deployer, Pool1);

  await callContractMethodFromMultisig(deployer, Pool1, 'initializePoolOne', [
    propTokenInstance.address,
  ]);
};
