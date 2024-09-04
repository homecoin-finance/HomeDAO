import { React, Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import NumberFormat from 'react-number-format';

import '../../styles/form.css';
import '../../styles/basicStyles.css';

import { unstakedHomeStore } from '../../store/homeStore';
import { etherscanUrlStore } from '../../store/appStore';

import { add, fromUnixTime, format } from 'date-fns';

import {
  claimBoost,
  claimBoostTransactionStateStore,
  homeBoostStore,
  beginAutoRenewBoost,
  beginAutoRenewBoostTransactionStateStore,
  endAutoRenewBoost,
  endAutoRenewBoostTransactionStateStore,
  withdrawBoost,
  withdrawBoostTransactionStateStore,
} from '../../store/homeBoostStore';

import { HomeValueEditor, MessagePanel, LoadingStatus } from '../../components';

import NewBoostPanel from './newBoostPanel';
import BoostList from './boostList';
import BigNumber from 'bignumber.js';

const MyBoostForm = ({ isActivePage }) => {
  const claimBoostTransactionState = useStore(claimBoostTransactionStateStore);
  const beginAutoRenewBoostTransactionState = useStore(
    beginAutoRenewBoostTransactionStateStore
  );
  const endAutoRenewBoostTransactionState = useStore(
    endAutoRenewBoostTransactionStateStore
  );
  const withdrawBoostTransactionState = useStore(
    withdrawBoostTransactionStateStore
  );
  const etherscanBaseUrl = useStore(etherscanUrlStore);
  const homeBoosts = useStore(homeBoostStore);
  const [overrideState, setOverrideState] = useState(null);
  const [previousTransactionState, setPreviousTransactionState] =
    useState('Base');
  const unstakedHome = useStore(unstakedHomeStore);

  const [currentTransactionArgs, setcurrentTransactionArgs] = useState({});

  let currentTransactionData = { transactionHash: '', state: 'Base' };
  if (claimBoostTransactionState.state !== 'Base') {
    currentTransactionData = claimBoostTransactionState;
  } else if (beginAutoRenewBoostTransactionState.state !== 'Base') {
    currentTransactionData = beginAutoRenewBoostTransactionState;
  } else if (endAutoRenewBoostTransactionState.state !== 'Base') {
    currentTransactionData = endAutoRenewBoostTransactionState;
  } else if (withdrawBoostTransactionState.state !== 'Base') {
    currentTransactionData = withdrawBoostTransactionState;
  }

  const currentTransactionState = currentTransactionData.state;

  if (previousTransactionState !== currentTransactionState) {
    if (
      currentTransactionState === 'Completed' ||
      currentTransactionState === 'Error'
    ) {
      setOverrideState(currentTransactionState);
    }
    setPreviousTransactionState(currentTransactionState);
  }

  const currentState =
    overrideState === null ? currentTransactionState : overrideState;

  const advanceState = () => {
    setOverrideState(null);
    setcurrentTransactionArgs({});
  };

  const renderSuccessContent = (amount, handleClose) => {
    if (currentTransactionArgs.type === 'ClaimRewards') {
      return (
        <MessagePanel
          firstMessage="You claimed Boost rewards"
          firstValue={`${amount} HOME`}
          onClose={handleClose}
        />
      );
    } else if (currentTransactionArgs.type === 'BeginAutoRenew') {
      return (
        <MessagePanel
          firstMessage="You started AutoRenew on a Boost"
          secondMessage="It will now automatically renew at the end of the boost time."
          onClose={handleClose}
        />
      );
    } else if (currentTransactionArgs.type === 'EndAutoRenew') {
      return (
        <MessagePanel
          firstMessage="You ended AutoRenew on a Boost"
          onClose={handleClose}
        />
      );
    } else if (currentTransactionArgs.type === 'WithdrawBoost') {
      return (
        <MessagePanel
          firstMessage="You withdrew a Boost and got"
          firstValue={`${amount} HOME`}
          onClose={handleClose}
        />
      );
    }
  };

  const getBoostFromId = (boostId) => {
    return homeBoosts.reduce((prev, current, index) => {
      if (prev !== null) {
        return prev;
      } else if (current.id === boostId) {
        return current;
      }
      return null;
    }, null);
  };

  const onClaimBoost = (boostId) => {
    const boost = getBoostFromId(boostId);
    setcurrentTransactionArgs({
      amount: boost.totalRewards.minus(boost.claimedRewards),
      type: 'ClaimRewards',
    });
    console.log('claim boost ' + boostId);
    claimBoost(boostId);
  };

  const onToggleAutoRenewBoost = (boostId) => {
    console.log('toggle auto renew ' + boostId);
    const boost = getBoostFromId(boostId);
    setcurrentTransactionArgs({
      amount: boost.totalRewards.minus(boost.claimedRewards),
      type: boost.isAutoRenew ? 'EndAutoRenew' : 'BeginAutoRenew',
    });

    if (boost.isAutoRenew) {
      endAutoRenewBoost(boostId);
    } else {
      beginAutoRenewBoost(boostId);
    }
  };

  const onWithdrawBoost = (boostId) => {
    console.log('withdraw click ' + boostId);
    const boost = getBoostFromId(boostId);
    setcurrentTransactionArgs({
      amount: boost.totalRewards
        .minus(boost.claimedRewards)
        .plus(boost.principal),
      type: 'WithdrawBoost',
    });
    withdrawBoost(boostId);
  };

  const transactionSecondMessage = currentTransactionData.transactionHash
    ? 'You can view the status of your transaction'
    : 'You may need to confirm the transaction with your wallet.';

  const etherscanUrl = currentTransactionData.transactionHash
    ? `${etherscanBaseUrl}/tx/${currentTransactionData.transactionHash}`
    : null;

  const renderContents = () => {
    if (currentState === 'Base') {
      return (
        <Fragment>
          <BoostList
            boosts={homeBoosts}
            onClaimClick={onClaimBoost}
            onToggleAutoRenewClick={onToggleAutoRenewBoost}
            onWithdrawClick={onWithdrawBoost}
          />
        </Fragment>
      );
    } else if (currentState === 'Pending') {
      return (
        <div className="pendingStatusContainer">
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
      const { amount } = currentTransactionArgs;
      return renderSuccessContent(amount, advanceState);
    } else {
      return <div>{'Unknown state ' + currentState}</div>;
    }
  };

  return <div className="form boostForm">{renderContents()}</div>;
};

export default MyBoostForm;
