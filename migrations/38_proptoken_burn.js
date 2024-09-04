require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const PropToken1 = artifacts.require('./PropTokens/PropToken1.sol');
const PropToken2 = artifacts.require('./PropTokens/PropToken2.sol');

const { upgradeContractFromMultisig, forceImportContract } = require('./utils');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }
  // forceImportContract(deployer, PropToken1);
  // throw "foo"
  await upgradeContractFromMultisig(deployer, PropToken2);
};
