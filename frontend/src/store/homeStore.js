import { atom, onMount, computed } from 'nanostores';
import BigNumber from 'bignumber.js';

import { getHomeBalance } from '../state';

import { userAddressStore, contractInstanceDataStore } from './appStore';

import { makeContractValueStore } from './storeUtils';
import { makeManagedTransaction } from './transactionManager';

import { steppedCurrentBlockTimestampStore } from './currentBlockStore';

import { makeTransaction } from './transactionUtils';

import { updateUsdcStore } from './usdcStore';

// Set BHome stores
export const stakedHomeStore = atom(new BigNumber('0'));

// Current total home rewards for holding home (the 1% for holding)
export const [homeHoldingRewardsStore, updateHomeHoldingRewards] =
  makeContractValueStore({
    initialValue: new BigNumber('0'),
    additionalUpstreamStores: [steppedCurrentBlockTimestampStore],
    getUpdateContractMethod: ({ contractInstances }) => {
      const { poolContractInstance } = contractInstances;
      return poolContractInstance.methods.claimRewards();
    },
    onUpdateSuccess: ({ val, store }) => {
      let bigValue = new BigNumber(val).shiftedBy(-6);
      store.set(bigValue);
    },
  });

export const totalHomeRewardsStore = computed(
  [homeHoldingRewardsStore],
  (totalHoldingRewards) => {
    // Soon this will be the sum of the holding rewards and the total home rewards from Boosts
    return totalHoldingRewards;
  }
);

export const pendingWithdrawInfoStore = atom();

export const updateStakedHome = (expectedValue) => {
  const contracts = contractInstanceDataStore.get();
  const userAddress = userAddressStore.get();
  if (!contracts || !userAddress) {
    return;
  }
  const { homeBoostContractInstance } = contractInstanceDataStore.get();

  homeBoostContractInstance.methods
    .claimPreBoostStake()
    .call({ from: userAddress }, (err, value) => {
      let bigValue = new BigNumber(value);
      bigValue = bigValue.shiftedBy(-6);
      stakedHomeStore.set(bigValue);
    });

  if (expectedValue !== null) {
    stakedHomeStore.set(expectedValue);
  }
};

onMount(stakedHomeStore, () => {
  const requiredStores = [userAddressStore, contractInstanceDataStore];
  let cb = (value) => {
    updateStakedHome(null);
  };
  updateStakedHome(null);
  let unbinds = requiredStores.map((store) => store.listen(cb));

  return () => {
    // Disabled Mode
    for (let unbind of unbinds) unbind();
  };
});

export const [unstakedHomeStore, updateUnstakedHome] = makeContractValueStore({
  initialValue: new BigNumber('0'),
  additionalUpstreamStores: [steppedCurrentBlockTimestampStore],
  getUpdateContractMethod: ({ userAddress, contractInstances }) => {
    const { poolContractInstance } = contractInstances;
    return poolContractInstance.methods.balanceOf(userAddress);
  },
  onUpdateSuccess: ({ val, store }) => {
    let bigValue = new BigNumber(val).shiftedBy(-6);
    store.set(bigValue);
  },
});

const exchangeRateStoreFactory = (method) => {
  const exchangeRateStore = atom(new BigNumber('1'));
  const exchangeRateAmountStore = atom(new BigNumber('1'));
  const exchangeAmountStore = atom(new BigNumber('1'));

  const updateExchangeRateStore = (expectedValue) => {
    const userAddress = userAddressStore.get();
    const { poolContractInstance } = contractInstanceDataStore.get();
    const amount = exchangeAmountStore.get();

    poolContractInstance.methods[method](
      amount.shiftedBy(6).toString(),
      0
    ).call({ from: userAddress }, (err, value) => {
      exchangeRateAmountStore.set(amount);

      if (err || !value) {
        exchangeRateStore.set(null);
      } else {
        let bigValue = new BigNumber(value);
        bigValue = bigValue.shiftedBy(-6);
        exchangeRateStore.set(bigValue);
      }
    });

    if (expectedValue !== null) {
      exchangeRateStore.set(expectedValue);
    }
  };

  onMount(exchangeRateStore, () => {
    const requiredStores = [
      userAddressStore,
      contractInstanceDataStore,
      exchangeAmountStore,
    ];
    let cb = (value) => {
      updateExchangeRateStore(null);
    };
    updateExchangeRateStore(null);
    let unbinds = requiredStores.map((store) => store.listen(cb));

    return () => {
      // Disabled Mode
      for (let unbind of unbinds) unbind();
    };
  });

  return [exchangeRateStore, exchangeRateAmountStore, exchangeAmountStore];
};

export const [
  lendExchangeRateStore,
  lendExchangeRateAmountStore,
  lendExchangeAmountStore,
] = exchangeRateStoreFactory('lendPool');
export const [
  redeemExchangeRateStore,
  redeemExchangeRateAmountStore,
  redeemExchangeAmountStore,
] = exchangeRateStoreFactory('redeemPool');

// Mutations

export const [stakeHomeTransactionStateStore, stakeHome] = makeTransaction(
  'Stake',
  (contractsStore, amount) => {
    const { poolContractInstance } = contractsStore.get();
    const fixedAmount = amount.shiftedBy(6);
    return poolContractInstance.methods.stake(fixedAmount.toString());
  },
  () => {
    updateUnstakedHome(null);
    updateStakedHome(null);
  }
);

export const [unstakeHomeTransactionStateStore, unstakeHome] = makeTransaction(
  'Unstake',
  (contractsStore) => {
    const { homeBoostContractInstance } = contractsStore.get();
    return homeBoostContractInstance.methods.claimPreBoostStake();
  },
  () => {
    updateUnstakedHome(null);
    updateStakedHome(null);
  }
);

export const [depositHomeTransactionStateStore, depositHome] = makeTransaction(
  'Deposit',
  (contractsStore, amount, expected) => {
    const { poolContractInstance } = contractsStore.get();
    const fixedAmount = amount.shiftedBy(6);
    const fixedExpected = expected.shiftedBy(6);
    return poolContractInstance.methods.lendPool(
      fixedAmount.toString(),
      fixedExpected.toString()
    );
  },
  () => {
    updateUnstakedHome(null);
    updateUsdcStore(null);
  }
);

export const [withdrawHomeTransactionStateStore, withdrawHome] =
  makeTransaction(
    'Withdraw',
    (contractsStore, amount, expected) => {
      const { poolContractInstance } = contractsStore.get();
      const fixedAmount = amount.shiftedBy(6);
      const fixedExpected = expected.shiftedBy(6);
      return poolContractInstance.methods.redeemPool(
        fixedAmount.toString(),
        fixedExpected.toString()
      );
    },
    () => {
      updateUnstakedHome(null);
      updateUsdcStore(null);
    }
  );

//
// Managed transactions
//

export const claimHomeHoldingRewardsTransaction = makeManagedTransaction({
  name: 'claimHomeHoldingRewards',
  analyticsName: 'claim home holding rewards',
  category: 'RewardsTransaction', // TODO: right?
  getContractMethod: (contractInstanceDataStore, transactionArgs) => {
    const { poolContractInstance } = contractInstanceDataStore.get();

    return poolContractInstance.methods.claimRewards();
  },
  onConfirmation: (transactionArgs) => {
    console.log('Claim confirmed!!');
    updateHomeHoldingRewards();
    updateUnstakedHome();
  },
});
