import React from 'react';

import '../../styles/form.css';
import '../../styles/basicStyles.css';

import {
  stakedHomeStore,
  unstakeHome,
  unstakeHomeTransactionStateStore,
} from '../../store/homeStore';

import { ContractValueActionPanel, MessagePanel } from '../../components';

const UnstakeForm = ({ isActivePage }) => {
  const beginUnstake = (amount) => {
    unstakeHome(amount);
  };

  const renderSuccessContent = (amount, handleClose) => {
    return (
      <MessagePanel
        firstMessage="You unstaked"
        firstValue={`${amount} USDC`}
        onClose={handleClose}
      />
    );
  };

  return (
    <ContractValueActionPanel
      hintContent="Rewards &darr;"
      infoContent="If you unstake now, you will lose future RWA rewards."
      actionButtonLabel="Unstake"
      valueTooHighContent="You don't have that much staked HOME."
      successContent={renderSuccessContent}
      valueStore={stakedHomeStore}
      startTransaction={beginUnstake}
      transactionStateStore={unstakeHomeTransactionStateStore}
      isActive={isActivePage}
    />
  );
};

export default UnstakeForm;
