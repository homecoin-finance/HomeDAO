import devUsdcAbi from '../contract_data/DevUSDC.json';
import poolAbi from '../contract_data/Pool15.json';
import poolUtilsAbi from '../contract_data/PoolUtils0.json';
import poolStakingAbi from '../contract_data/PoolStaking2.json';
import poolStakingRewardsAbi from '../contract_data/PoolStakingRewards7.json';
import baconCoinAbi from '../contract_data/BaconCoin4.json';
import rwaCoinAbi from '../contract_data/RealWorldAsset.json';
import propTokenAbi from '../contract_data/PropToken0.json';
import governorAlphaAbi from '../contract_data/GovernorAlpha.json';
import stakingAbi from '../contract_data/Staking4.json';
import homeBoostAbi from '../contract_data/HomeBoost4.json';
import developmentAddresses from '../contract_data/developmentConfig.json';
import ropstenAddresses from '../contract_data/ropstenConfig.json';
import rinkebyAddresses from '../contract_data/rinkebyConfig.json';
import goerliAddresses from '../contract_data/goerliConfig.json';
import mainnetAddresses from '../contract_data/mainnetConfig.json';
import outsidePoolAbi from '../contract_data/OutsidePool0.json';

export const getContractInstance = ({ network, web3 }) => {
  let contractAddresses = developmentAddresses;

  if (network === 3) {
    console.log('ropsten');
    contractAddresses = ropstenAddresses;
  } else if (network === 4) {
    console.log('rinkeby');
    contractAddresses = rinkebyAddresses;
  } else if (network === 5) {
    console.log('goerli');
    contractAddresses = goerliAddresses;
  } else if (network === 1) {
    console.log('mainnet');
    contractAddresses = mainnetAddresses;
  }

  // Get the usdc contract instance using contract's abi and address:
  console.log('usdc address ' + contractAddresses.usdcAddress);
  console.log(contractAddresses);
  const devUsdcJson = JSON.parse(JSON.stringify(devUsdcAbi));
  const usdcContractInstance = new web3.eth.Contract(
    devUsdcJson.abi,
    contractAddresses.usdcAddress
  );
  console.log('usdc contract address ' + usdcContractInstance._address);

  //Get the OutsidePool contract instance using contract's abi and address:
  const outsidePoolJson = JSON.parse(JSON.stringify(outsidePoolAbi));
  const outsidePoolContractInstance = new web3.eth.Contract(
    outsidePoolJson.abi,
    contractAddresses.outsidePoolAddress
  );

  // Get the pool contract instance using contract's abi and address:
  const poolJson = JSON.parse(JSON.stringify(poolAbi));
  const poolContractInstance = new web3.eth.Contract(
    poolJson.abi,
    contractAddresses.poolAddress
  );

  // Get the poolUtils contract instance using contract's abi and address:
  const poolUtilsJson = JSON.parse(JSON.stringify(poolUtilsAbi));
  const poolUtilsContractInstance = new web3.eth.Contract(
    poolUtilsJson.abi,
    contractAddresses.poolUtilsAddress
  );

  // Get the poolStakingRewards contract instance using contract's abi and address:
  const poolStakingRewardsJson = JSON.parse(
    JSON.stringify(poolStakingRewardsAbi)
  );
  const poolStakingRewardsContractInstance = new web3.eth.Contract(
    poolStakingRewardsJson.abi,
    contractAddresses.poolStakingRewardsAddress
  );

  //Get the propToken contract instance using contract's abi and address:
  const propTokenJson = JSON.parse(JSON.stringify(propTokenAbi));
  const propTokenContractInstance = new web3.eth.Contract(
    propTokenJson.abi,
    contractAddresses.propTokenAddress
  );

  //Get the BaconCoin contract instance using contract's abi and address:
  const baconCoinJson = JSON.parse(JSON.stringify(baconCoinAbi));
  const baconCoinContractInstance = new web3.eth.Contract(
    baconCoinJson.abi,
    contractAddresses.baconCoinAddress
  );

  //Get the BaconCoin contract instance using contract's abi and address:
  const rwaCoinJson = JSON.parse(JSON.stringify(rwaCoinAbi));
  const rwaCoinContractInstance = new web3.eth.Contract(
    rwaCoinJson.abi,
    contractAddresses.rwaCoinAddress
  );

  //Get the governorAlpha contract instance using contract's abi and address:
  const governorAlphaJson = JSON.parse(JSON.stringify(governorAlphaAbi));
  const governorAlphaContractInstance = new web3.eth.Contract(
    governorAlphaJson.abi,
    contractAddresses.GovernorAlpha
  );

  //Get the staking contract instance using contract's abi and address:
  const stakingJson = JSON.parse(JSON.stringify(stakingAbi));
  const stakingContractInstance = new web3.eth.Contract(
    stakingJson.abi,
    contractAddresses.stakingAddress
  );

  //Get the homeBoost contract instance using contract's abi and address:
  const homeBoostJson = JSON.parse(JSON.stringify(homeBoostAbi));
  const homeBoostContractInstance = new web3.eth.Contract(
    homeBoostJson.abi,
    contractAddresses.homeBoostAddress
  );

  // If there are any LP tokens we want to make available init their contracts here:
  const lpStakableInstances = {};
  const lpStakableNameToAddress = contractAddresses['lpStakable'];
  if (lpStakableNameToAddress) {
    for (const contractName in lpStakableNameToAddress) {
      const stakableAddress = lpStakableNameToAddress[contractName];
      const contractInstance = new web3.eth.Contract(
        devUsdcJson.abi,
        stakableAddress
      );
      lpStakableInstances[contractName] = contractInstance;
    }
  }

  return {
    contractInstanceData: {
      web3,
      usdcContractInstance,
      outsidePoolContractInstance,
      poolContractInstance,
      poolUtilsContractInstance,
      poolStakingRewardsContractInstance,
      propTokenContractInstance,
      baconCoinContractInstance,
      rwaCoinContractInstance,
      governorAlphaContractInstance,
      stakingContractInstance,
      homeBoostContractInstance,
      lpStakableInstances,
      lpStakableNameToAddress,
      contractAddresses,
    },
  };
};
