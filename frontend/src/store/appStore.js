import { atom, computed } from 'nanostores';

export const web3Store = atom();
export const networkStore = atom();

export const userAddressStore = atom();
export const contractInstanceDataStore = atom();

export const etherscanUrlStore = computed(networkStore, (networkId) => {
  if (networkId === 1) {
    return 'https://etherscan.io';
  } else if (networkId === 4) {
    return 'https://rinkeby.etherscan.io';
  } else if (networkId === 5) {
    return 'https://goerli.etherscan.io';
  } else {
    return 'https://test.etherscan.io';
  }
});
