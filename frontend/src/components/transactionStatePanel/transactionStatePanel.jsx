import { React, Fragment, useState, useRef } from 'react';
import { useStore } from '@nanostores/react';

import { LoadingStatus, MessagePanel, HomeValueEditor } from '../../components';

import { etherscanUrlStore } from '../../store/appStore';

import './transactionStatePanel.css';

export const TransactionStatePanel = ({
  className,
  transactionState,
  successContent,
}) => {
  const etherscanBaseUrl = useStore(etherscanUrlStore);

  if (!transactionState) {
    return null;
  }

  const currentState = transactionState.state;

  const completeTransaction = () => {
    transactionState.doComplete();
  };

  const renderContents = () => {
    const etherscanUrl = transactionState.transactionHash
      ? `${etherscanBaseUrl}/tx/${transactionState.transactionHash}`
      : null;
    const transactionSecondMessage = transactionState.transactionHash
      ? 'You can view the status of your transaction'
      : 'You may need to confirm the transaction with your wallet.';
    if (currentState === 'Base') {
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
            onClose={completeTransaction}
          />
        </div>
      );
    } else if (currentState === 'Completed') {
      const successContentFinal =
        typeof successContent === 'function' ? (
          successContent(transactionState.uiData, completeTransaction)
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

  return <div className={className}>{renderContents()}</div>;
};
