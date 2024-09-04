import React from 'react';
import { Link } from 'react-router-dom';

import '../../styles/form.css';
import '../../styles/basicStyles.css';

import {
  unstakedHomeStore,
  stakeHome,
  stakeHomeTransactionStateStore,
} from '../../store/homeStore';

import { ContractValueActionPanel, MessagePanel } from '../../components';

const StakeForm = ({ isActivePage }) => {
  const beginStake = (amount) => {
    stakeHome(amount);
  };

  const getValueTooHighContent = () => {
    return (
      <p>
        You don't have that much Home to stake.{' '}
        <Link to="/?subPage=deposit">Get More</Link>
      </p>
    );
  };

  const renderSuccessContent = (amount, handleClose) => {
    return (
      <MessagePanel
        firstMessage="You staked"
        firstValue={`${amount} HOME`}
        onClose={handleClose}
      />
    );
  };

  return (
    <ContractValueActionPanel
      hintContent="Stake for rewards"
      valueTooHighContent={getValueTooHighContent}
      successContent={renderSuccessContent}
      actionButtonLabel={'Stake'}
      valueStore={unstakedHomeStore}
      startTransaction={beginStake}
      transactionStateStore={stakeHomeTransactionStateStore}
      isActive={isActivePage}
    />
  );
};

export default StakeForm;
