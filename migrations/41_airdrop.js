require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  environment: 'truffle',
});

const BN = web3.utils.BN;

const LSAirdrop = artifacts.require(
  './Airdrop/LSAirdrop.sol'
);

const {
  getMultisigAddress,
  deployNonUpgradableContract,
} = require('./utils');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await deployNonUpgradableContract(
    deployer,
    LSAirdrop,
    [getMultisigAddress(network)],
    { networkConfigName: 'LSAirdropAddress' }
  );
};
