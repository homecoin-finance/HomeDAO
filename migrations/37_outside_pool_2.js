require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const OutsidePool1 = artifacts.require('./OutsidePool/OutsidePool1.sol');
const OutsidePool2 = artifacts.require('./OutsidePool/OutsidePool2.sol');

const {
  callContractMethodFromMultisig,
  upgradeContractFromMultisig,
  forceImportContract,
} = require('./utils');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }
  await forceImportContract(deployer, OutsidePool1);

  if (network == 'mainnet') {
      callContractMethodFromMultisig(deployer, OutsidePool1, 'pause', []);
  }
  await upgradeContractFromMultisig(deployer, OutsidePool2);

  if (network == 'mainnet') {
      const addrs = ['0x0eadd490458f9dcd1379bd8694db2c4eda6aca07', '0x2f7e2a6e4ade03c10f8555180c8a6cf8541bc5b4', '0x58ba5a24fa8833477339072f1221e03bb3b29130'];
      callContractMethodFromMultisig(deployer, OutsidePool2, 'copyEpochs', ['0x5c6a6cf9ae657a73b98454d17986af41fc7b44ee', addrs])
      callContractMethodFromMultisig(deployer, OutsidePool2, 'unpause', []);
  }
};
