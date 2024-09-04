import { atom, onMount, computed } from 'nanostores';

import { web3Store } from './appStore';

export const currentBlockStore = atom({ number: 0 });

onMount(currentBlockStore, () => {
  // TODO: listen for changes on this
  const web3 = web3Store.get();
  const subscription = web3.eth
    .subscribe('newBlockHeaders', function (error, result) {
      if (!error) {
        return;
      }
      console.error(error);
    })
    .on('data', function (blockHeader) {
      currentBlockStore.set(blockHeader);
    })
    .on('error', console.error);

  web3.eth.getBlock('latest').then((latestBlock) => {
    currentBlockStore.set(latestBlock);
  });

  return () => {
    // unsubscribe when the store is no longer in use
    subscription.unsubscribe(function (error, success) {
      if (error) {
        console.log('Failed to unsubscribe ' + error);
      }
    });
  };
});

export const currentBlockNumberStore = computed(
  [currentBlockStore],
  (currentBlock) => {
    return currentBlock.number;
  }
);

export const currentBlockTimestampStore = computed(
  [currentBlockStore],
  (currentBlock) => {
    return currentBlock.timestamp;
  }
);

const prevBlockTimeStore = atom(0);
export const steppedCurrentBlockTimestampStore = computed(
  [currentBlockTimestampStore],
  (currentTime) => {
    const prevBlockTime = prevBlockTimeStore.get();
    if (currentTime - prevBlockTime > 60) {
      prevBlockTimeStore.set(currentTime);
      return currentTime;
    } else {
      return prevBlockTime;
    }
  }
);
