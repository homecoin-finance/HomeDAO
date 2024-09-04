import { React, Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import NumberFormat from 'react-number-format';

import '../../styles/form.css';
import '../../styles/basicStyles.css';

import {
  unstakedHomeStore,
  unstakeHomeTransactionStateStore,
  unstakeHome,
} from '../../store/homeStore';
import { etherscanUrlStore } from '../../store/appStore';

import { add, fromUnixTime, format } from 'date-fns';

import {
  boostHome,
  boostHomeTransactionStateStore,
  homeBoostStore,
  boostRateStore,
} from '../../store/homeBoostStore';

import { HomeValueEditor, MessagePanel, LoadingStatus } from '../../components';

import NewBoostPanel from './newBoostPanel';
import BoostList from './boostList';
import BigNumber from 'bignumber.js';

const BoostForm = ({ isActivePage }) => {
  const newBoostTransactionState = useStore(boostHomeTransactionStateStore);
  const unstakeTransactionState = useStore(unstakeHomeTransactionStateStore);
  const etherscanBaseUrl = useStore(etherscanUrlStore);
  const homeBoosts = useStore(homeBoostStore);
  const boostRates = useStore(boostRateStore);
  const [overrideState, setOverrideState] = useState(null);
  const [previousTransactionState, setPreviousTransactionState] =
    useState('Base');
  const unstakedHome = useStore(unstakedHomeStore);

  const [currentTransactionArgs, setcurrentTransactionArgs] = useState({});

  let currentTransactionData = { transactionHash: '', state: 'Base' };
  if (newBoostTransactionState.state !== 'Base') {
    currentTransactionData = newBoostTransactionState;
  } else if (unstakeTransactionState.state !== 'Base') {
    currentTransactionData = unstakeTransactionState;
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
    if (currentTransactionArgs.type === 'NewBoost') {
      return (
        <MessagePanel
          firstMessage="You boosted"
          firstValue={`${amount} HOME`}
          onClose={handleClose}
        />
      );
    } else if (currentTransactionArgs.type === 'Unstake') {
      return (
        <MessagePanel
          firstMessage="You unstaked"
          firstValue={`${amount} HOME`}
          onClose={handleClose}
        />
      );
    }
  };

  const onNewLevel1Boost = (amount) => {
    setcurrentTransactionArgs({ amount: amount, type: 'NewBoost' });
    boostHome(amount, 1, true);
  };

  const onNewLevel2Boost = (amount) => {
    setcurrentTransactionArgs({ amount: amount, type: 'NewBoost' });
    boostHome(amount, 2, true);
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
          <div className="boostHomeAmtTitle">
            Boostable&nbsp;HOME:
            <NumberFormat
              className="boostHomeAmtValue"
              displayType="text"
              value={unstakedHome.toString()}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale
            />
          </div>
          <NewBoostPanel
            id="level1Boost"
            level={1}
            rate={boostRates[1]}
            onNewBoostClick={onNewLevel1Boost}
          />
          <NewBoostPanel
            id="level2Boost"
            level={2}
            rate={boostRates[2]}
            onNewBoostClick={onNewLevel2Boost}
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

export default BoostForm;
