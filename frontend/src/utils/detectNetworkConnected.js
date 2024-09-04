export const detectNetworkConnected = (networkName) => {
  console.log('networkName: ', networkName);
  if (networkName === 'mainnet') {
    // Production
    return 1;
  } else if (networkName === 'goerli') {
    // Staging/Dev
    return 5;
  } else {
    // if network id is not defined in env variable
    return 1337;
  }
};
