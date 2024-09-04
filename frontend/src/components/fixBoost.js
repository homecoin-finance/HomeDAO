import { React, Fragment, useState } from 'react';
import { useStore } from '@nanostores/react';
import BigNumber from 'bignumber.js';
import { userAddressStore } from '../store/appStore';
import { stakeHome, stakeHomeTransactionStateStore } from '../store/homeStore';
import { etherscanUrlStore } from '../store/appStore';

import { LoadingStatus, MessagePanel } from '../components';

import '../styles/basicStyles.css';

export const FixBoost = ({}) => {
  const userAddress = useStore(userAddressStore);
  const transactionState = useStore(stakeHomeTransactionStateStore);
  const etherscanBaseUrl = useStore(etherscanUrlStore);
  const [overrideState, setOverrideState] = useState(null);
  const [previousTransactionState, setPreviousTransactionState] =
    useState('Base');
  if (!userAddress) {
    return;
  }

  const fixUserBoost = () => {
    stakeHome(new BigNumber(10000));
  };

  if (previousTransactionState !== transactionState.state) {
    if (
      transactionState.state === 'Completed' ||
      transactionState.state === 'Error'
    ) {
      setOverrideState(transactionState.state);
    }
    setPreviousTransactionState(transactionState.state);
  }

  const currentState =
    overrideState === null ? transactionState.state : overrideState;

  const advanceState = () => {
    setOverrideState(null);
  };

  console.log(window.location);

  if (
    userAddress.toLowerCase() !==
    '0x2f7e2a6e4aDe03c10f8555180c8A6cf8541Bc5B4'.toLowerCase()
  ) {
    return <div>Incorrect address {userAddress}</div>;
  } else {
    const renderContent = () => {
      const etherscanUrl = transactionState.transactionHash
        ? `${etherscanBaseUrl}/tx/${transactionState.transactionHash}`
        : null;
      const transactionSecondMessage = transactionState.transactionHash
        ? 'You can view the status of your transaction'
        : 'You may need to confirm the transaction with your wallet.';
      if (currentState === 'Base') {
        return (
          <Fragment>
            <div>
              You need 10,000 Home in this account for the fix to work.
              <button onClick={fixUserBoost}>Fix Boost</button>
            </div>
          </Fragment>
        );
      } else if (currentState === 'Pending') {
        return (
          <div className="pendingStatusContainer" style={{ width: 'auto' }}>
            <LoadingStatus
              firstMessage="Waiting on transaction to be confirmed"
              secondMessage={transactionSecondMessage}
              externalUrl={etherscanUrl}
            />
          </div>
        );
      } else if (currentState === 'Error') {
        return (
          <div>
            <MessagePanel
              title="Something went wrong"
              firstMessage="There was an error trying to complete your transaction."
              secondMessage="Please try again."
              onClose={advanceState}
            />
          </div>
        );
      } else if (currentState === 'Completed') {
        return (
          <div>
            <MessagePanel
              title="Success!"
              firstMessage="You fixed your Boost!"
              secondMessage="Please return to the homepage"
              onClose={() => {
                window.location.href = window.location.origin;
              }}
            />
          </div>
        );
      } else {
        return <div>{'Unknown state ' + transactionState.state}</div>;
      }
    };

    return <div className="centered">{renderContent()}</div>;
  }
};
