import BigNumber from 'bignumber.js';
import { computed } from 'nanostores';

import { makeContractValueStore } from './storeUtils';
import { userAddressStore, contractInstanceDataStore } from './appStore';
import { updateRwaCoinBalance } from './rwaStore';
import { makeManagedTransaction } from './transactionManager';

const makeStakableDecimalsStore = (lpTokenName) => {
  const [decimalStore] = makeContractValueStore({
    initialValue: new BigNumber('0'),
    getUpdateContractMethod: ({ contractInstances }) => {
      const { lpStakableInstances } = contractInstances;
      const stakableContractInstance = lpStakableInstances[lpTokenName];
      return stakableContractInstance.methods.decimals();
    },
    onUpdateSuccess: ({ val, store }) => {
      let bigValue = new BigNumber(val);
      store.set(bigValue);
    },
  });
  return decimalStore;
};

const makeStakableAddressStore = (lpTokenName) => {
  const addressStore = computed(
    contractInstanceDataStore,
    (contractInstances) => {
      const { lpStakableNameToAddress } = contractInstances;
      return lpStakableNameToAddress[lpTokenName];
    }
  );
  return addressStore;
};

const makeStakableUnstakedStore = (lpTokenName, decimalsStore) => {
  return makeContractValueStore({
    initialValue: new BigNumber('0'),
    additionalUpstreamStores: [decimalsStore],
    getUpdateContractMethod: ({ userAddress, contractInstances }) => {
      const { lpStakableInstances } = contractInstances;
      const stakableContractInstance = lpStakableInstances[lpTokenName];
      return stakableContractInstance.methods.balanceOf(userAddress);
    },
    onUpdateSuccess: ({ val, additionalCurrentValues, store }) => {
      const [decimals] = additionalCurrentValues;
      let bigValue = new BigNumber(val);
      bigValue = bigValue.shiftedBy(-decimals.toNumber());
      store.set(bigValue);
    },
  });
};

const makeStakableAllowanceStore = (lpTokenName, decimalsStore) => {
  return makeContractValueStore({
    initialValue: new BigNumber('0'),
    additionalUpstreamStores: [decimalsStore],
    getUpdateContractMethod: ({ userAddress, contractInstances }) => {
      const { lpStakableInstances, contractAddresses } = contractInstances;
      const stakableContractInstance = lpStakableInstances[lpTokenName];
      return stakableContractInstance.methods.allowance(
        userAddress,
        contractAddresses.outsidePoolAddress
      );
    },
    onUpdateSuccess: ({ val, additionalCurrentValues, store }) => {
      const [decimals] = additionalCurrentValues;
      let bigValue = new BigNumber(val);
      bigValue = bigValue.shiftedBy(-decimals.toNumber());
      store.set(bigValue);
    },
  });
};

const makeStakableStakedStore = (lpTokenName, decimalsStore) => {
  return makeContractValueStore({
    initialValue: new BigNumber('0'),
    additionalUpstreamStores: [decimalsStore],
    getUpdateContractMethod: ({ userAddress, contractInstances }) => {
      const { outsidePoolContractInstance, lpStakableNameToAddress } =
        contractInstances;
      const lpTokenAddress = lpStakableNameToAddress[lpTokenName];

      return outsidePoolContractInstance.methods.getCurrentBalance(
        userAddress,
        lpTokenAddress
      );
    },
    onUpdateSuccess: ({ val, additionalCurrentValues, store }) => {
      const [decimals] = additionalCurrentValues;
      let bigValue = new BigNumber(val);
      bigValue = bigValue.shiftedBy(-decimals.toNumber());
      store.set(bigValue);
    },
  });
};

const makeUnclaimedRewardsStore = (lpTokenName) => {
  return makeContractValueStore({
    initialValue: new BigNumber('0'),
    getUpdateContractMethod: ({ userAddress, contractInstances }) => {
      const { outsidePoolContractInstance, lpStakableNameToAddress } =
        contractInstances;
      const lpTokenAddress = lpStakableNameToAddress[lpTokenName];

      return outsidePoolContractInstance.methods.massHarvest(
        lpTokenAddress,
        userAddress
      );
    },
    onUpdateSuccess: ({ val, store }) => {
      let bigValue = new BigNumber(val);
      // Rewards are in Rwa
      bigValue = bigValue.shiftedBy(-18);
      store.set(bigValue);
    },
  });
};

export const lpTokenNames = ['curveHome3crv', 'sushiBaconEth'];

const initLPStores = () => {
  const lpStores = {};
  for (const tokenName of lpTokenNames.values()) {
    console.log('initLPStores ' + tokenName);
    const decimalStore = makeStakableDecimalsStore(tokenName);
    const addressStore = makeStakableAddressStore(tokenName);
    const [unstakedStore, updateUnstaked] = makeStakableUnstakedStore(
      tokenName,
      decimalStore
    );
    const [approvedStore, updateApprovedStore] = makeStakableAllowanceStore(
      tokenName,
      decimalStore
    );
    const [stakedStore, updateStaked] = makeStakableStakedStore(
      tokenName,
      decimalStore
    );
    const [rewardsStore, updateRewards] = makeUnclaimedRewardsStore(tokenName);

    lpStores[tokenName] = {
      decimalStore,
      addressStore,
      approvedStore,
      updateApprovedStore,
      unstakedStore,
      updateUnstaked,
      stakedStore,
      updateStaked,
      rewardsStore,
      updateRewards,
    };
  }
  console.log(lpStores);
  return lpStores;
};

export const lpTokenStores = initLPStores();

//
// Transactions
//

export const approveLPTokenTransaction = makeManagedTransaction({
  name: 'ApproveLPToken',
  analyticsName: 'approve token',
  category: 'LPTransaction',
  getContractMethod: (contractInstanceDataStore, transactionArgs) => {
    const { tokenKey } = transactionArgs;
    const { contractAddresses, web3, lpStakableInstances } =
      contractInstanceDataStore.get();
    const stakableContractInstance = lpStakableInstances[tokenKey];
    return stakableContractInstance.methods.approve(
      contractAddresses.outsidePoolAddress,
      web3.utils.toBN(
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      )
    );
  },
  onConfirmation: (transactionArgs) => {
    const { tokenKey } = transactionArgs;
    const lpTokenStore = lpTokenStores[tokenKey];
    lpTokenStore.updateApprovedStore();
  },
});

export const stakeLPTokenTransaction = makeManagedTransaction({
  name: 'StakeLPToken',
  analyticsName: 'stake lp token',
  category: 'LPTransaction',
  getContractMethod: (contractInstanceDataStore, transactionArgs) => {
    const { tokenKey, amount } = transactionArgs;

    const { outsidePoolContractInstance } = contractInstanceDataStore.get();
    const lpStores = lpTokenStores[tokenKey];

    const decimals = lpStores.decimalStore.get();
    const lpTokenAddress = lpStores.addressStore.get();

    const fixedAmount = amount.shiftedBy(decimals.toNumber());

    return outsidePoolContractInstance.methods.stake(
      lpTokenAddress,
      fixedAmount.toFixed()
    );
  },
  onConfirmation: (transactionArgs) => {
    const { tokenKey } = transactionArgs;
    const lpTokenStore = lpTokenStores[tokenKey];
    lpTokenStore.updateUnstaked();
    lpTokenStore.updateStaked();
  },
});

export const unstakeLPTokenTransaction = makeManagedTransaction({
  name: 'UnstakeLPToken',
  analyticsName: 'unstake lp token',
  category: 'LPTransaction',
  getContractMethod: (contractInstanceDataStore, transactionArgs) => {
    const { tokenKey, amount } = transactionArgs;

    const { outsidePoolContractInstance } = contractInstanceDataStore.get();
    const lpStores = lpTokenStores[tokenKey];

    const decimals = lpStores.decimalStore.get();
    const lpTokenAddress = lpStores.addressStore.get();

    const fixedAmount = amount.shiftedBy(decimals.toNumber());

    return outsidePoolContractInstance.methods.unstake(
      lpTokenAddress,
      fixedAmount.toFixed()
    );
  },
  onConfirmation: (transactionArgs) => {
    const { tokenKey } = transactionArgs;
    const lpTokenStore = lpTokenStores[tokenKey];
    lpTokenStore.updateUnstaked();
    lpTokenStore.updateStaked();
  },
});

export const claimLPTokenRewardsTransaction = makeManagedTransaction({
  name: 'claimLPTokenRewards',
  analyticsName: 'claim lp token rewards',
  category: 'LPTransaction',
  getContractMethod: (contractInstanceDataStore, transactionArgs) => {
    const { tokenKey } = transactionArgs;

    const userAddress = userAddressStore.get();

    const { outsidePoolContractInstance } = contractInstanceDataStore.get();
    const lpStores = lpTokenStores[tokenKey];

    const lpTokenAddress = lpStores.addressStore.get();

    return outsidePoolContractInstance.methods.massHarvest(
      lpTokenAddress,
      userAddress
    );
  },
  onConfirmation: (transactionArgs) => {
    const { tokenKey } = transactionArgs;
    const lpTokenStore = lpTokenStores[tokenKey];
    lpTokenStore.updateRewards();
    updateRwaCoinBalance();
  },
});
