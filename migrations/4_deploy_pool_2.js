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
  deployNonUpgradableContract,
} = require('./utils');

const Pool2 = artifacts.require('./Pools/Pool2.sol');
const propToken0 = artifacts.require('./PropTokens/PropToken0.sol');
const LTVOracle = artifacts.require('./LTVGuidelines.sol');

module.exports = async function (deployer, network, accounts) {
  if (network === 'testing') {
    return;
  }

  await upgradeContractFromMultisig(deployer, Pool2);

  await deployNonUpgradableContract(deployer, LTVOracle, []);

  ltvOracleAddress = getContractAddress(network, LTVOracle.contractName);

  await callContractMethodFromMultisig(deployer, Pool2, 'initializePoolTwo', [
    ltvOracleAddress,
  ]);

  if (network === 'development') {
    console.log('about to mint bad propToken (LTV too high)');
    const propTokenInstance = await propToken0.deployed();
    await propTokenInstance.mintPropToken(
      accounts[0],
      100000000000,
      [750000000000],
      1000000000000,
      '221B Baker Street, London, UK',
      'http://public.media.smithsonianmag.com/legacy_blog/221_sh-museum.jpg'
    );
  }
};
