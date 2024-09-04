import BigNumber from 'bignumber.js';

import { makeContractValueStore } from './storeUtils';
import { makeManagedTransaction } from './transactionManager';

import { userAddressStore, contractInstanceDataStore } from './appStore';
import { steppedCurrentBlockTimestampStore } from './currentBlockStore';

export const [rwaCoinBalanceStore, updateRwaCoinBalance] =
  makeContractValueStore({
    initialValue: new BigNumber('0'),
    getUpdateContractMethod: ({ userAddress, contractInstances }) => {
      const { rwaCoinContractInstance } = contractInstances;
      return rwaCoinContractInstance.methods.balanceOf(userAddress);
    },
    onUpdateSuccess: ({ val, store }) => {
      let bigValue = new BigNumber(val).shiftedBy(-18);
      store.set(bigValue);
    },
  });

export const [rwaCoinAccruedStore, updateRwaCoinAccrued] =
  makeContractValueStore({
    initialValue: new BigNumber('0'),
    additionalUpstreamStores: [steppedCurrentBlockTimestampStore],
    getUpdateContractMethod: ({ userAddress, contractInstances }) => {
      const { poolStakingRewardsContractInstance } = contractInstances;
      return poolStakingRewardsContractInstance.methods.massHarvest(
        userAddress
      );
    },
    onUpdateSuccess: ({ val, store }) => {
      let bigValue = new BigNumber(val).shiftedBy(-18);
      store.set(bigValue);
    },
  });

export const claimBoostRwaRewardsTransaction = makeManagedTransaction({
  name: 'claimBoostRwaRewards',
  analyticsName: 'claim boost rwa rewards',
  category: 'RwaRewardsTransaction', // TODO: right?
  getContractMethod: (contractInstanceDataStore, transactionArgs) => {
    const userAddress = userAddressStore.get();
    const { poolStakingRewardsContractInstance } =
      contractInstanceDataStore.get();

    return poolStakingRewardsContractInstance.methods.massHarvest(userAddress);
  },
  onConfirmation: (transactionArgs) => {
    updateRwaCoinBalance();
    updateRwaCoinAccrued();
  },
});
