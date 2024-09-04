require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const { upgradeContractFromMultisig } = require('./utils');

const PoolUtils1 = artifacts.require('./PoolUtils/PoolUtils1.sol');
const Pool7 = artifacts.require('./PoolCore/Pool7.sol');

module.exports = async function (deployer, network) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, PoolUtils1);

  await upgradeContractFromMultisig(deployer, Pool7);
};
