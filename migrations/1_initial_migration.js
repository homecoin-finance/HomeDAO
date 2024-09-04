const Migrations = artifacts.require('Migrations');

module.exports = function (deployer, network) {
  if (network === 'testing') {
    return;
  }
  deployer.deploy(Migrations);
};
