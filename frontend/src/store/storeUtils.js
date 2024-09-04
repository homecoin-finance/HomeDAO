import { onMount, atom } from 'nanostores';

import { userAddressStore, contractInstanceDataStore } from './appStore';

// Make a store that calls a function on a contract and saves the result in the store.
export const makeContractValueStore = ({
  initialValue,
  additionalUpstreamStores,
  getUpdateContractMethod,
  onUpdateSuccess,
  onUpdateError,
}) => {
  const store = atom(initialValue);
  if (!additionalUpstreamStores) {
    additionalUpstreamStores = [];
  }

  if (!getUpdateContractMethod || !onUpdateSuccess) {
    throw 'You must define getUpdateContractMethod and onUpdateSuccess';
  }

  const updateStore = (expectedValue) => {
    const additionalCurrentValues = additionalUpstreamStores.map((s) =>
      s.get()
    );
    const userAddress = userAddressStore.get();
    const contractInstances = contractInstanceDataStore.get();
    const allSet =
      additionalCurrentValues.length !== 0
        ? additionalCurrentValues.reduce((prev, cur) => cur && prev, true)
        : true;
    if (!allSet || !userAddress || !contractInstances) {
      return;
    }

    const contractMethod = getUpdateContractMethod({
      userAddress,
      contractInstances,
      additionalCurrentValues,
    });
    contractMethod.call({ from: userAddress }, (err, val) => {
      if (err) {
        onUpdateError && onUpdateError(err);
        return;
      }
      onUpdateSuccess({
        val,
        userAddress,
        contractInstances,
        additionalCurrentValues,
        store,
      });
    });
  };

  onMount(store, () => {
    let cb = (value) => {
      updateStore(null);
    };

    // TODO: Only do this if there are no upstream stores?
    updateStore(null);

    const allStores = [userAddressStore, contractInstanceDataStore].concat(
      additionalUpstreamStores
    );
    let unbinds = allStores.map((s) => s.listen(cb));

    return () => {
      // Disabled Mode
      for (let unbind of unbinds) unbind();
    };
  });

  return [store, updateStore];
};
