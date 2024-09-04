import { atom, map, onMount, computed } from 'nanostores';
import BigNumber from 'bignumber.js';

import { userAddressStore, contractInstanceDataStore } from './appStore';
import { updateUnstakedHome, updateStakedHome } from './homeStore';

import {
  makeTransaction,
  transactionStateStore,
  setTransactionState,
  initTransactionState,
  setErrorTransactionState,
  setTransactionHash,
  setCompletedTransactionState,
} from './transactionUtils';

export const weeklyRewardsStore = atom(BigNumber('0'));

export const homeBoostStore = atom([]);
export const boostRateStore = map({
  1: new BigNumber('0.02'),
  2: new BigNumber('0.04'),
});

export const boostedHomeStore = computed(homeBoostStore, (boosts) => {
  return boosts.reduce((prev, current) => {
    prev = prev.plus(current.principal);
    return prev;
  }, new BigNumber('0'));
});

export const updateHomeBoostStore = (expectedValue) => {
  const contracts = contractInstanceDataStore.get();
  const userAddress = userAddressStore.get();
  if (!contracts || !userAddress) {
    return;
  }
  const { homeBoostContractInstance } = contractInstanceDataStore.get();

  homeBoostContractInstance.methods
    .getTokens()
    .call({ from: userAddress }, (err, value) => {
      if (err) {
        console.log('error updating home boost store');
        console.log(err);
        return;
      }
      const cleanedValue = value.map((currentBoost) => {
        return {
          id: currentBoost.id,
          startTime: currentBoost.startTime,
          principal: new BigNumber(currentBoost.principal).shiftedBy(-6),
          claimedRewards: new BigNumber(currentBoost.claimedRewards).shiftedBy(
            -6
          ),
          totalRewards: new BigNumber(currentBoost.totalRewards).shiftedBy(-6),
          apy: new BigNumber(currentBoost.apy).shiftedBy(-6),
          nextRewardTimestamp: currentBoost.nextRewardTimestamp,
          level: currentBoost.level,
          isComplete: currentBoost.isComplete,
          isAutoRenew: currentBoost.isAutoRenew,
        };
      });
      homeBoostStore.set(cleanedValue);
    });

  if (expectedValue !== null) {
    homeBoostStore.set(expectedValue);
  }
};

onMount(homeBoostStore, () => {
  const requiredStores = [userAddressStore, contractInstanceDataStore];
  let cb = (value) => {
    updateHomeBoostStore(null);
  };
  updateHomeBoostStore(null);
  let unbinds = requiredStores.map((store) => store.listen(cb));

  return () => {
    // Disabled Mode
    for (let unbind of unbinds) unbind();
  };
});

export const updateBoostRate = (expectedValue) => {
  const contracts = contractInstanceDataStore.get();
  const userAddress = userAddressStore.get();
  if (!contracts || !userAddress) {
    return;
  }

  const { homeBoostContractInstance } = contractInstanceDataStore.get();

  homeBoostContractInstance.methods
    .getAPYForLevel(1)
    .call({ from: userAddress }, (err, value) => {
      let bigValue = new BigNumber(value);
      bigValue = bigValue.shiftedBy(-6);
      boostRateStore.setKey(1, bigValue);
    });

  homeBoostContractInstance.methods
    .getAPYForLevel(2)
    .call({ from: userAddress }, (err, value) => {
      let bigValue = new BigNumber(value);
      bigValue = bigValue.shiftedBy(-6);
      boostRateStore.setKey(2, bigValue);
    });

  if (expectedValue !== null) {
    boostRateStore.set(expectedValue);
  }
};

onMount(boostRateStore, () => {
  const requiredStores = [userAddressStore, contractInstanceDataStore];
  let cb = (value) => {
    updateBoostRate(null);
  };
  updateBoostRate(null);
  let unbinds = requiredStores.map((store) => store.listen(cb));

  return () => {
    // Disabled Mode
    for (let unbind of unbinds) unbind();
  };
});

export const updateWeeklyRewards = (expectedValue) => {
  const contracts = contractInstanceDataStore.get();
  const userAddress = userAddressStore.get();
  if (!contracts || !userAddress) {
    return;
  }

  const { stakingContractInstance, poolStakingRewardsContractInstance } =
    contractInstanceDataStore.get();

  stakingContractInstance.methods
    .getCurrentEpoch()
    .call({ from: userAddress }, (err, value) => {
      poolStakingRewardsContractInstance.methods
        .getRewardAtEpoch(value)
        .call({ from: userAddress }, (err, value) => {
          if (err) return;

          let bigValue = new BigNumber(value);
          bigValue = bigValue.shiftedBy(-18);
          weeklyRewardsStore.set(bigValue);
        });
    });

  if (expectedValue !== null) {
    weeklyRewardsStore.set(expectedValue);
  }
};

onMount(weeklyRewardsStore, () => {
  const requiredStores = [userAddressStore, contractInstanceDataStore];
  let cb = (value) => {
    updateWeeklyRewards(null);
  };
  updateWeeklyRewards(null);
  let unbinds = requiredStores.map((store) => store.listen(cb));

  return () => {
    // Disabled Mode
    for (let unbind of unbinds) unbind();
  };
});

//
// Mutations
//

// Boost
export const boostHomeTransactionStateStore = transactionStateStore();

export const boostHome = (amount, level, autoRenew) => {
  if (window.analytics) {
    window.analytics.track('Click Boost Home', {
      amount,
      level: level,
      autoRenew: autoRenew,
    });
  }
  const userAddress = userAddressStore.get();

  initTransactionState(boostHomeTransactionStateStore);

  const { poolContractInstance } = contractInstanceDataStore.get();

  const fixedAmount = amount.shiftedBy(6);

  return poolContractInstance.methods
    .boost(fixedAmount.toString(), level, autoRenew)
    .send({ from: userAddress }, (err, res) => {
      if (err) {
        console.log('Boost Home error: ', err);
        setTransactionState(boostHomeTransactionStateStore, { state: 'Error' });
      }
    })
    .on('transactionHash', (hash) => {
      setTransactionHash(boostHomeTransactionStateStore, hash);
      if (window.analytics) {
        window.analytics.track('Boost Home Started', {
          amount,
          tx: hash,
        });
      }
    })
    .once('confirmation', (confNumber, receipt, latestBlockHash) => {
      updateUnstakedHome(null);
      updateStakedHome(null);
      updateHomeBoostStore(null);
      setCompletedTransactionState(boostHomeTransactionStateStore);
    })
    .on('error', () => {
      setErrorTransactionState(boostHomeTransactionStateStore);
    });
};

// claim any rewards and the principal and burn the boost
export const [withdrawBoostTransactionStateStore, withdrawBoost] =
  makeTransaction(
    'Withdraw Boost',
    (contractsStore, boostId) => {
      const { homeBoostContractInstance } = contractsStore.get();
      return homeBoostContractInstance.methods.claimPrincipal(
        boostId.toString()
      );
    },
    () => {
      updateHomeBoostStore(null);
      updateUnstakedHome(null);
      updateStakedHome(null);
    }
  );

// start autoRenew

export const [beginAutoRenewBoostTransactionStateStore, beginAutoRenewBoost] =
  makeTransaction(
    'Begin autorenew Boost',
    (contractsStore, boostId) => {
      const { homeBoostContractInstance } = contractsStore.get();
      return homeBoostContractInstance.methods.setToAutoRenew(
        boostId.toString()
      );
    },
    () => {
      updateHomeBoostStore(null);
    }
  );

// end autoRenew

export const [endAutoRenewBoostTransactionStateStore, endAutoRenewBoost] =
  makeTransaction(
    'End autorenew Boost',
    (contractsStore, boostId) => {
      const { homeBoostContractInstance } = contractsStore.get();
      return homeBoostContractInstance.methods.endAutoRenew(boostId.toString());
    },
    () => {
      updateHomeBoostStore(null);
    }
  );

// claim
export const [claimBoostTransactionStateStore, claimBoost] = makeTransaction(
  'Claim Boost',
  (contractsStore, boostId) => {
    const { homeBoostContractInstance } = contractsStore.get();
    return homeBoostContractInstance.methods.claimRewards(boostId.toString());
  },
  () => {
    updateHomeBoostStore(null);
    updateUnstakedHome(null);
    updateStakedHome(null);
  }
);
