import { atom } from 'nanostores';

import { userAddressStore, contractInstanceDataStore } from './appStore';

const timeoutToBaseFrom = ['Error', 'Completed'];

export const setTransactionState = (store, overrideState) => {
  let currentState = store.get();
  let newState = { ...currentState, ...overrideState };
  store.set(newState);
  if (timeoutToBaseFrom.includes(overrideState.state)) {
    timeoutToBase(store);
  }
};

const initialState = { transactionHash: '', state: 'Base' };

const timeoutToBase = (store) => {
  console.log('timout to base: ' + initialState);
  setTimeout(() => {
    setTransactionState(store, initialState);
  }, 2000);
};

export const transactionStateStore = () => {
  return atom(initialState);
};

export const initTransactionState = (store) => {
  setTransactionState(store, { transactionHash: '', state: 'Pending' });
};

export const setErrorTransactionState = (store) => {
  setTransactionState(store, { state: 'Error' });
};

export const setTransactionHash = (store, txHash) => {
  setTransactionState(store, { transactionHash: txHash });
};

export const setCompletedTransactionState = (store) => {
  setTransactionState(store, { state: 'Completed' });
};

// TODO: maybe an onMount that initializes the store from chain data?

export const makeTransaction = (
  analyticsName,
  getContractMethod,
  onConfirmation
) => {
  const transactionStateStore = atom({
    transactionHash: '',
    state: 'Base',
  });

  const executeTransaction = (amount, ...args) => {
    if (window.analytics) {
      window.analytics.track('Click ' + analyticsName, { amount });
    }
    const userAddress = userAddressStore.get();

    setTransactionState(transactionStateStore, {
      transactionHash: '',
      state: 'Pending',
    });

    return getContractMethod(contractInstanceDataStore, amount, ...args)
      .send({ from: userAddress }, (err, res) => {
        if (err) {
          console.log(analyticsName + ' error: ', err);
          setTransactionState(transactionStateStore, { state: 'Error' });
        }
      })
      .on('transactionHash', (hash) => {
        setTransactionState(transactionStateStore, {
          transactionHash: hash,
        });
        if (window.analytics) {
          window.analytics.track(analyticsName + ' Started', {
            amount,
            tx: hash,
          });
        }
      })
      .once('confirmation', (confNumber, receipt, latestBlockHash) => {
        onConfirmation();
        setTransactionState(transactionStateStore, {
          state: 'Completed',
        });
      })
      .on('error', () => {
        setTransactionState(transactionStateStore, { state: 'Error' });
      });
  };

  return [transactionStateStore, executeTransaction];
};
