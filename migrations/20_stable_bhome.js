require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const {
  upgradeContractFromMultisig,
  callContractMethodFromMultisig,
} = require('./utils');

const Pool11 = artifacts.require('./PoolCore/Pool11.sol');
const Staking1 = artifacts.require('./Staking/Staking1.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, Pool11);

  await callContractMethodFromMultisig(
    deployer,
    Pool11,
    'initializePool11',
    []
  );

  await upgradeContractFromMultisig(deployer, Staking1);

  // TODO manually:
  // 1. (if needed) Pass servicer(guardian) rights for Pool11 to the multisig by calling passServicerRights(multisigAddress)
  // 2. Airdrop difference in bHOME
};
