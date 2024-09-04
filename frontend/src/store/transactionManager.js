import { atom, computed } from 'nanostores';

import { userAddressStore, contractInstanceDataStore } from './appStore';

// listen for transaction changes
// transactionList = useStore(transactionQueueStore);

// run the transaction list looking for one that is active and a type we care about
// if we found one
// draw the transaction UI with it
// when user hits the "okay" button on the completed or error ui, call 'doComplete' on the transaction state
// OR UI can call this whenever if it wants to remove the transaction from the active list
// ==>
// transaction instances have type
// transaction instances have state that covers the UI need (e.g. UI complete for when the user has pressed the okay button)

// A collection of all the transactions.
export const transactionQueueStore = atom([]);

export const firstActiveTransaction = computed(
  [transactionQueueStore],
  (transactions) => {
    return transactions.find((transaction) => transaction.active);
  }
);

export const getActiveTransactionOfCategory = (transactions, category) => {
  return transactions.find(
    (transaction) => transaction.active && transaction.category === category
  );
};

const setManagedTransactionState = (id, overrideState) => {
  const transactions = transactionQueueStore.get();
  let currentState = transactions[id];
  let newState = { ...currentState, ...overrideState };
  transactions[id] = newState;
  transactionQueueStore.notify();
};

// Make a managed transaction. Start a new instance of this
// transaction by calling startManagedTransaction with it
export const makeManagedTransaction = ({
  analyticsName,
  name,
  category,
  getContractMethod,
  onConfirmation,
}) => {
  return {
    name,
    analyticsName,
    category,
    getContractMethod,
    onConfirmation,
  };
};

export const startManagedTransaction = (transaction, transactionArgs) => {
  const userAddress = userAddressStore.get();
  let transactions = transactionQueueStore.get();
  const transactionId = transactions.length;

  const completeTransaction = () => {
    setManagedTransactionState(transactionId, { active: false });
  };

  transactions.push({
    id: transactionId,
    category: transaction.category,
    active: true,
    transactionHash: '',
    state: 'Pending',
    doComplete: completeTransaction,
    uiData: transactionArgs,
  });

  transactionQueueStore.notify();

  const transactionPromise = transaction
    .getContractMethod(contractInstanceDataStore, transactionArgs)
    .send({ from: userAddress }, (err, res) => {
      if (err) {
        console.log(transaction.analyticsName + ' error: ', err);
        setManagedTransactionState(transactionId, { state: 'Error' });
      }
    })
    .on('transactionHash', (hash) => {
      setManagedTransactionState(transactionId, {
        transactionHash: hash,
      });
      if (window.analytics) {
        window.analytics.track(transaction.analyticsName + ' Started', {
          transactionArgs,
          tx: hash,
        });
      }
    })
    .once('confirmation', (confNumber, receipt, latestBlockHash) => {
      transaction.onConfirmation(transactionArgs);
      setManagedTransactionState(transactionId, {
        state: 'Completed',
      });
    })
    .on('error', () => {
      setManagedTransactionState(transactionId, { state: 'Error' });
    });
  return transactionPromise;
};
