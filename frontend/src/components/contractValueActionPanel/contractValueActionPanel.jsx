import { React, Fragment, useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import NumberFormat from 'react-number-format';
import BigNumber from 'bignumber.js';

import { LoadingStatus, MessagePanel, HomeValueEditor } from '../../components';

import { etherscanUrlStore } from '../../store/appStore';

import './contractValueActionPanel.css';

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    setTimeout(() => {
      htmlElRef.current && htmlElRef.current.focus();
    });
  };

  return [htmlElRef, setFocus];
};

export const ContractValueActionPanel = ({
  hintContent,
  infoContent,
  valueTooHighContent,
  disabledWarningContent,
  successContent,
  actionButtonLabel,
  valueStore,
  startTransaction,
  transactionStateStore,
  isActive,
  isDisabled,
  onChange,
}) => {
  const currentValue = useStore(valueStore);
  const transactionState = useStore(transactionStateStore);
  const etherscanBaseUrl = useStore(etherscanUrlStore);
  const [actionValue, setActionValue] = useState(new BigNumber('0'));
  const [wasActive, setWasActive] = useState(false);
  const [overrideState, setOverrideState] = useState(null);
  const [previousTransactionState, setPreviousTransactionState] =
    useState('Base');
  const [amountRef, setInputFocus] = useFocus();

  if (previousTransactionState !== transactionState.state) {
    if (
      transactionState.state === 'Completed' ||
      transactionState.state === 'Error'
    ) {
      setOverrideState(transactionState.state);
    }
    setPreviousTransactionState(transactionState.state);
  }

  const onActionClick = () => {
    startTransaction(actionValue);
  };

  let hintContentFinal = hintContent;
  if (typeof hintContent === 'function') {
    hintContentFinal = hintContent();
  } else {
    hintContentFinal = <p>{hintContent}</p>;
  }

  let infoContentFinal = infoContent;
  if (typeof infoContent === 'function') {
    infoContentFinal = infoContent();
  } else {
    infoContentFinal = <p>{infoContent}</p>;
  }

  const valueTooHighContentFinal =
    typeof valueTooHighContent === 'function' ? (
      valueTooHighContent()
    ) : (
      <p>{valueTooHighContent}</p>
    );

  const disabledWarningContentFinal =
    typeof disabledWarningContent === 'function' ? (
      disabledWarningContent()
    ) : (
      <p>{disabledWarningContent}</p>
    );

  if (isActive !== wasActive) {
    if (isActive) {
      setInputFocus();
    }
    setWasActive(isActive);
  }

  const currentState =
    overrideState === null ? transactionState.state : overrideState;

  const advanceState = () => {
    setOverrideState(null);
    setActionValue(new BigNumber(0));
    setInputFocus();
  };

  const renderContents = () => {
    const etherscanUrl = transactionState.transactionHash
      ? `${etherscanBaseUrl}/tx/${transactionState.transactionHash}`
      : null;
    const transactionSecondMessage = transactionState.transactionHash
      ? 'You can view the status of your transaction'
      : 'You may need to confirm the transaction with your wallet.';
    if (currentState === 'Base') {
      return (
        <Fragment>
          <div className="hintText">{hintContentFinal}</div>
          <div className="infoText">{infoContentFinal}</div>
          {/* <div>{' '+currentValue}</div> */}
          <HomeValueEditor
            inputRef={amountRef}
            onHomeValueChange={(newValue) => {
              setActionValue(newValue);
              onChange && onChange(newValue);
            }}
            maxValue={currentValue}
            valueTooHighContent={valueTooHighContentFinal}
            disabledWarningContent={disabledWarningContentFinal}
            buttonLabel={actionButtonLabel}
            onButtonClick={onActionClick}
            isDisabled={isDisabled}
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
      const successContentFinal =
        typeof successContent === 'function' ? (
          successContent(actionValue, advanceState)
        ) : (
          <p>{successContent}</p>
        );
      return (
        <div>
          <div className="transactionMessageTitle">Success!</div>
          <div className="transactionMessageContent">{successContentFinal}</div>
        </div>
      );
    } else {
      return <div>{'Unknown state ' + transactionState.state}</div>;
    }
  };

  return <div className="form">{renderContents()}</div>;
};
