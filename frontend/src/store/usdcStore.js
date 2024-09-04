import { atom, onMount } from 'nanostores';
import BigNumber from 'bignumber.js';

import { userAddressStore, contractInstanceDataStore } from './appStore';
import {
  transactionStateStore,
  initTransactionState,
  setErrorTransactionState,
  setCompletedTransactionState,
  setTransactionHash,
} from './transactionUtils';

export const usdcStore = atom(new BigNumber('0'));
export const usdcAllowanceStore = atom(new BigNumber('0'));

export const updateUsdcStore = (expectedValue) => {
  const contracts = contractInstanceDataStore.get();
  const userAddress = userAddressStore.get();
  if (!contracts || !userAddress) {
    return;
  }
  const { usdcContractInstance } = contracts;
  usdcContractInstance.methods
    .balanceOf(userAddress)
    .call({ from: userAddress }, (err, value) => {
      let bigValue = new BigNumber(value);
      bigValue = bigValue.shiftedBy(-6);
      usdcStore.set(bigValue);
    });

  if (expectedValue !== null) {
    usdcStore.set(expectedValue);
  }
};

onMount(usdcStore, () => {
  const requiredStores = [userAddressStore, contractInstanceDataStore];
  let cb = (value) => {
    updateUsdcStore(null);
  };
  updateUsdcStore(null);
  let unbinds = requiredStores.map((store) => store.listen(cb));

  return () => {
    // Disabled Mode
    for (let unbind of unbinds) unbind();
  };
});

export const updateUsdcAllowanceStore = (expectedValue) => {
  const contracts = contractInstanceDataStore.get();
  const userAddress = userAddressStore.get();
  if (!contracts || !userAddress) {
    return;
  }

  const { usdcContractInstance, contractAddresses } = contracts;
  usdcContractInstance.methods
    .allowance(userAddress, contractAddresses.poolAddress)
    .call({ from: userAddress }, (err, value) => {
      let bigValue = new BigNumber(value);
      bigValue = bigValue.shiftedBy(-6);
      usdcAllowanceStore.set(bigValue);
    });

  if (expectedValue !== null) {
    usdcAllowanceStore.set(expectedValue);
  }
};

onMount(usdcAllowanceStore, () => {
  const requiredStores = [userAddressStore, contractInstanceDataStore];
  let cb = (value) => {
    updateUsdcAllowanceStore(null);
  };
  updateUsdcAllowanceStore(null);
  let unbinds = requiredStores.map((store) => store.listen(cb));

  return () => {
    // Disabled Mode
    for (let unbind of unbinds) unbind();
  };
});

//
// Mutations
//

export const approveUsdcTransferTransactionStateStore = transactionStateStore();

export const approveUsdcTransfer = () => {
  const contracts = contractInstanceDataStore.get();
  const userAddress = userAddressStore.get();
  if (!contracts || !userAddress) {
    return;
  }
  const { contractAddresses, usdcContractInstance, web3 } = contracts;

  const amount = web3.utils
    .toBN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    .toString();

  if (window.analytics) {
    window.analytics.track('Click Approve', {});
  }

  initTransactionState(approveUsdcTransferTransactionStateStore);

  usdcContractInstance.methods
    .approve(contractAddresses.poolAddress, amount)
    .send({ from: userAddress }, (err, res) => {
      if (err) {
        setErrorTransactionState(approveUsdcTransferTransactionStateStore);
      }
    })
    .on('transactionHash', (hash) => {
      if (window.analytics) {
        window.analytics.track('Approve Started', { tx: hash });
      }
      setTransactionHash(approveUsdcTransferTransactionStateStore, hash);
    })
    .once('confirmation', () => {
      updateUsdcAllowanceStore(null);
      setCompletedTransactionState(approveUsdcTransferTransactionStateStore);
    })
    .on('error', () => {
      setErrorTransactionState(approveUsdcTransferTransactionStateStore);
    });
};
