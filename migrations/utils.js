const fs = require('fs');

const { AdminClient } = require('defender-admin-client');

const contract = require('@truffle/contract');

const {
  deployProxy,
  upgradeProxy,
  prepareUpgrade,
  forceImport,
} = require('@openzeppelin/truffle-upgrades');

// Gets the core contract name from a given contract. For our
// contracts this means stripping the version number off of the end
// of the given contract's name. Will do nothing for contracts that don't
// have a version number at the end.
const getContractNameFromString = (contractName) => {
  let index = contractName.length - 1;
  let c = contractName[index];
  while (c >= '0' && c <= '9') {
    index--;
    c = contractName[index];
  }
  return contractName.substring(0, index + 1);
};

const getContractName = (contract) => {
  let contractName = contract.contractName;
  return getContractNameFromString(contractName);
};

let addressesCache = null;

const getAddresses = (network) => {
  if (!addressesCache) {
    // If using a forked network, then we should expect the same addresses on that
    // network as the network from which we forked.
    if (network.endsWith('-fork')) {
      network = network.substring(0, network.length - 5);
    }
    const rawAddresses = fs.readFileSync(
      './deployments/addresses-' + network + '.json'
    );
    const addressJson = JSON.parse(rawAddresses);
    addressesCache = addressJson;
  }
  return addressesCache;
};

const saveContractAddress = (network, contract, address) => {
  const contractName = getContractName(contract);
  let networkAddresses = getAddresses(network);

  networkAddresses[contractName] = address;

  fs.writeFileSync(
    './deployments/addresses-' + network + '.json',
    JSON.stringify(networkAddresses, null, 2),
    (err) => {
      if (err) throw err;
    }
  );
};

// Gets the Multisig address for the given network. On public networks, this is a
// Gnosis safe that we use to execute changes to the contracts.
const getMultisigAddress = (network) => {
  return getAddresses(network)['multisig'];
};

const getContractAddress = (network, contractName) => {
  return getAddresses(network)[getContractNameFromString(contractName)];
};

const ensureOZEnvironment = () => {
  if (!process.env.DEFENDER_API_KEY || !process.env.DEFENDER_API_SECRET) {
    throw 'ERROR: Must specify DEFENDER_API_KEY and DEFENDER_API_SECRET for this migration';
  }
};

let ozAdminClient;
const getOZAdminClient = () => {
  if (!ozAdminClient) {
    ensureOZEnvironment();
    ozAdminClient = new AdminClient({
      apiKey: process.env.DEFENDER_API_KEY,
      apiSecret: process.env.DEFENDER_API_SECRET,
    });
  }
  return ozAdminClient;
};

let contractCache = {};

const loadContractData = (compiledContractJsonName) => {
  let contractJson = contractCache[compiledContractJsonName];
  if (!contractJson) {
    let contractRawData = fs.readFileSync(
      './build/contracts/' + compiledContractJsonName
    );
    contractJson = JSON.parse(contractRawData);
    contractCache[compiledContractJsonName] = contractJson;
  }

  return contractJson;
};

const loadContractAbi = (compiledContractJsonName) => {
  let contractJson = loadContractData(compiledContractJsonName);
  return contractJson.abi;
};

const getContractNameFromCompiledJsonName = (compiledContractJsonName) => {
  let contractJson = loadContractData(compiledContractJsonName);
  return contractJson.contractName;
};

const getContractJsonName = (contract) => {
  return contract.contractName + '.json';
};

// Updates the contract Abi on OpenZeppelin Defender. Calling this
// again will update the abi for this address.
const updateContractAbiOnOZ = async (
  network,
  address,
  compiledContractJsonName
) => {
  if (network === 'development') {
    return;
  }

  const client = getOZAdminClient();
  let contractAbi = loadContractAbi(compiledContractJsonName);

  const contractName = getContractNameFromString(
    compiledContractJsonName.replace('.json', '')
  );

  try {
    await client.addContract({
      network: network,
      address: address,
      name:
        network.charAt(0).toUpperCase() + network.slice(1) + ' ' + contractName,
      abi: JSON.stringify(contractAbi),
    });
  } catch (e) {
    console.log(e);
    throw 'Failed to update the OpenZeppelin contract info for ' + contractName;
  }
};

const getNetworkConfig = (network) => {
  let networkConfigRawData = fs.readFileSync(
    './frontend/src/contract_data/' + network + 'Config.json'
  );
  return JSON.parse(networkConfigRawData);
};

const updateNetworkConfig = (network, modifyConfig) => {
  let networkConfig = getNetworkConfig(network);
  newConfig = modifyConfig(networkConfig);

  fs.writeFileSync(
    './frontend/src/contract_data/' + network + 'Config.json',
    JSON.stringify(networkConfig, null, 2),
    (err) => {
      if (err) throw err;
    }
  );
};

const publishFrontendAbi = async (jsonName) => {
  console.log('publishing ' + jsonName);
  try {
    await fs.promises.copyFile(
      './build/contracts/' + jsonName,
      './frontend/src/contract_data/' + jsonName
    );
  } catch (err) {
    console.log('Error copying compiled json file.');
    throw err;
  }
  console.log(jsonName + ' was copied to ./frontend/src/contract_data');
};

const deployNonUpgradableContractCore = async (
  deployer,
  network,
  contract,
  constructorArgs,
  networkConfigName, // key to be used in the network config pointing to this contract
  compiledContractJsonName // the file name of the compiled json for the contract
) => {
  await deployer.deploy(contract, ...constructorArgs);

  const contractInstance = await contract.deployed();

  if (networkConfigName) {
    updateNetworkConfig(network, (networkConfig) => {
      networkConfig[networkConfigName] = contractInstance.address;
    });
  }

  if (!deployer.options.dryRun) {
    updateContractAbiOnOZ(
      network,
      contractInstance.address,
      compiledContractJsonName
    );
  } else {
    ensureOZEnvironment();
  }

  // TODO: technically don't need to do this if the contract isn't exposed to the front
  // end at all through a networkConfigName
  saveContractAddress(network, contract, contractInstance.address);

  if (networkConfigName) {
    await publishFrontendAbi(compiledContractJsonName);
  }

  return contractInstance;
};

const deployNonUpgradableContract = async (
  deployer,
  contract,
  constructorArgs,
  options
) => {
  if (!options) {
    options = {};
  }
  const { networkConfigName } = options;
  return await deployNonUpgradableContractCore(
    deployer,
    deployer.network,
    contract,
    constructorArgs,
    networkConfigName,
    getContractJsonName(contract)
  );
};

// Deploys a contract that implements OpenZeppelin's upgradable contract pattern. At the very
// least it should be derive from the OpenZeppelin Initializable contract.
const deployUpgradableContractCore = async (
  deployer,
  network,
  contract,
  constructorArgs,
  networkConfigName,
  compiledContractJsonName
) => {
  await deployProxy(contract, constructorArgs, { deployer });

  const contractInstance = await contract.deployed();

  if (networkConfigName) {
    updateNetworkConfig(network, (networkConfig) => {
      networkConfig[networkConfigName] = contractInstance.address;
    });
  }

  if (!deployer.options.dryRun) {
    updateContractAbiOnOZ(
      network,
      contractInstance.address,
      compiledContractJsonName
    );
  } else {
    ensureOZEnvironment();
  }

  saveContractAddress(network, contract, contractInstance.address);

  // TODO: technically don't need to do this if the contract isn't exposed to the front
  // end at all through a networkConfigName
  await publishFrontendAbi(compiledContractJsonName);

  return contractInstance;
};

const deployUpgradableContract = async (
  deployer,
  contract,
  constructorArgs,
  options
) => {
  if (!options) {
    options = {};
  }
  const { networkConfigName } = options;
  return await deployUpgradableContractCore(
    deployer,
    deployer.network,
    contract,
    constructorArgs,
    networkConfigName,
    getContractJsonName(contract)
  );
};

const callContractMethodFromMultisigCore = async (
  deployer,
  network,
  proxyAddress,
  deployedContract,
  functionName,
  functionArgs,
  compiledContractJsonName
) => {
  if (network === 'development') {
    // For development, just call the method directly.
    console.log('calling method ' + functionName + ' in dev network.');
    await deployedContract[functionName](...functionArgs, {
      from: getMultisigAddress(network),
    });
  } else {
    // This is a public network. Propose the change through OZ Defender
    // so it can execute through the multisig
    if (deployer.options.dryRun) {
      ensureOZEnvironment();
      console.log(
        'Skipping call to ' + functionName + ' because this is a dry run.'
      );
      return;
    }
    let contractAbi = loadContractAbi(compiledContractJsonName);
    // find the method we want to call
    let functionAbi = contractAbi.find(
      (element) => element['name'] === functionName
    );

    if (!functionAbi) {
      throw 'ERROR: Could not find function abi for ' + functionName;
    }

    // arguments passed to defender have to be strings.
    const stringArgs = functionArgs.map((value) => value.toString());

    console.log('===function abi====');
    console.log(network);
    console.log(functionAbi);
    console.log(stringArgs);
    console.log('===========');

    // propose change
    const adminClient = getOZAdminClient();

    try {
      await adminClient.createProposal({
        contract: { address: proxyAddress, network: network },
        title: 'Call ' + functionName,
        description: '',
        type: 'custom',
        functionInterface: functionAbi,
        functionInputs: stringArgs,
        via: getMultisigAddress(network),
        viaType: 'Gnosis Safe',
      });
    } catch (e) {
      console.log(e);
      throw 'Creating proposal failed';
    }
  }
};

// TODO: these two methods don't seem to work completely. I can't use the OZ deployment functions
// with a contract created this way, for instance, but I can call methods successfully.
const getTruffleContract = (deployer, contractName) => {
  // const contractJson = loadContractData(contractName + '.json');
  const contractJson = require('../build/contracts/' + contractName + '.json');
  console.log(contractJson);
  const truffleContract = contract(contractJson);
  truffleContract.setProvider(deployer.provider);
  return truffleContract;
};

// Gets a truffle deployed contract instance for the given contract name
// If contractName is an implementation contract for an upgradable contract,
// will return a truffle contract set up to call through the proxy with the version
// of the API noted in the contractName
// Example: getDeployedContract(deployer, 'Pool10')
const getDeployedContract = async (deployer, contractName) => {
  const truffleContract = getTruffleContract(deployer, address);
  const contractAddress = getContractAddress(deployer.network, contractName);
  return await truffleContract.at(contractAddress);
};

const callContractMethodFromMultisig = async (
  deployer,
  contract,
  functionName,
  functionArgs
) => {
  const contractAddress = getContractAddress(
    deployer.network,
    contract.contractName
  );
  const deployedContract = await contract.at(contractAddress);
  await callContractMethodFromMultisigCore(
    deployer,
    deployer.network,
    contractAddress,
    deployedContract,
    functionName,
    functionArgs,
    contract.contractName + '.json'
  );
};

const upgradeContractFromMultisigCore = async (
  deployer,
  network,
  proxyAddress, // the address of the contract transparent upgradable proxy
  newContract, // the new implementation contract
  compiledContractJsonName, // the file name of the compiled json for the contract
  options
) => {
  if (network === 'development') {
    // directly call update
    await upgradeProxy(proxyAddress, newContract, { deployer, ...options });
  } else {
    // This is a public network, so have to update through the multisig
    const newImplementation = await prepareUpgrade(proxyAddress, newContract, {
      deployer,
      ...options,
    });
    console.log('deployed implementation contract to ' + newImplementation);

    const contract = { network: network, address: proxyAddress };
    const newImplementationAbi = loadContractAbi(compiledContractJsonName);

    if (deployer.options.dryRun) {
      // Make sure that we can get the admin client using the current environment so a final run will work.
      ensureOZEnvironment();

      console.log(
        'Skipping OZ call to upgrade ' +
          compiledContractJsonName.replace('.json', '') +
          ' because this is a dry run.'
      );
      return;
    }
    const multisigAddress = getMultisigAddress(network);
    const adminClient = getOZAdminClient();

    try {
      console.log(
        'proposing upgrade for address ' +
          proxyAddress +
          ' to implementation contract ' +
          newImplementation
      );
      await adminClient.proposeUpgrade(
        {
          newImplementation: newImplementation,
          via: multisigAddress,
          viaType: 'Gnosis Safe',
          newImplementationAbi: JSON.stringify(newImplementationAbi),
        },
        contract
      );
    } catch (e) {
      console.log(e);
      throw 'Failed to propose upgrade to contract ' + compiledContractJsonName;
    }
  }

  if (compiledContractJsonName) {
    await publishFrontendAbi(compiledContractJsonName);
  }
};

const upgradeContractFromMultisig = async (
  deployer,
  newContract, // the new implementation contract
  options
) => {
  await upgradeContractFromMultisigCore(
    deployer,
    deployer.network,
    getContractAddress(deployer.network, newContract.contractName),
    newContract,
    newContract.contractName + '.json',
    options
  );
};

//
// Useful to have around in case the OZ deployment file gets out of sync.
// This will cause errors like:
// "Error: Deployment at address 0xF000913D37d69149B10f64f5A8490f965C54D3E8 is not registered
// To register a previously deployed proxy for upgrading, use the forceImport function."
//
// CALL THIS ONCE with the previous contract version and that should fix up the deployment file.
// You can then remove the call from the deployment script (if that's where you added it)
//
const forceImportContract = async (deployer, contract) => {
  await forceImport(
    getContractAddress(deployer.network, contract.contractName),
    contract,
    {
      deployer,
    }
  );
};

// This method can be used in test net scenarios where you want to temporarily upgrade
// the contract implementation of a contract to a new implementation that lets you set some
// storage variables that you wouldn't otherwise be able to set. This can help with initializing
// values for tests, etc.
// DO NOT DO THIS ON MAINNET
const upgradeOverrideContractFromMultisig = async (
  deployer,
  contractToOverride,
  newContract,
  options
) => {
  if (deployer.network === 'mainnet') {
    throw 'ERROR: Do not use this function on Mainnet';
  }
  await upgradeContractFromMultisigCore(
    deployer,
    deployer.network,
    getContractAddress(deployer.network, contractToOverride.contractName),
    newContract,
    '', // Don't copy a json to the frontend for an override contract
    options
  );
};

module.exports = {
  getMultisigAddress: getMultisigAddress,
  getContractAddress: getContractAddress,
  updateNetworkConfig: updateNetworkConfig,
  publishFrontendAbi: publishFrontendAbi,
  deployNonUpgradableContract: deployNonUpgradableContract,
  deployUpgradableContract: deployUpgradableContract,
  callContractMethodFromMultisig: callContractMethodFromMultisig,
  getOZAdminClient: getOZAdminClient,
  upgradeContractFromMultisig: upgradeContractFromMultisig,
  upgradeOverrideContractFromMultisig: upgradeOverrideContractFromMultisig,
  getNetworkConfig: getNetworkConfig,
  forceImportContract: forceImportContract,
};
