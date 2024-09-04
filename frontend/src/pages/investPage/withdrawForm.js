import { React, Fragment } from 'react';
import { useStore } from '@nanostores/react';

import '../../styles/form.css';
import '../../styles/basicStyles.css';

import { ContractValueActionPanel, MessagePanel } from '../../components';
import NumberFormat from 'react-number-format';
import BigNumber from 'bignumber.js';

import {
  unstakedHomeStore,
  withdrawHome,
  withdrawHomeTransactionStateStore,
  redeemExchangeRateStore,
  redeemExchangeAmountStore,
  redeemExchangeRateAmountStore,
} from '../../store/homeStore';

const WithdrawForm = ({ isActivePage }) => {
  const exchangeRate = useStore(redeemExchangeRateStore);
  const exchangeRateAmount = useStore(redeemExchangeRateAmountStore);
  const exchangeAmount = useStore(redeemExchangeAmountStore);

  const beginWithdraw = (amount) => {
    withdrawHome(amount, exchangeRate);
  };

  const onTextChange = (amount) => {
    if (amount == 0) {
      amount = new BigNumber('1');
    }
    redeemExchangeAmountStore.set(amount);
  };

  const renderHintContent = () => {
    return (
      <Fragment>
        <span className="titleText">
          HOME <span className="green">&rarr;</span>USDC
        </span>
        <div className="subtitleText">
          <span className="green">
            {exchangeRateAmount.toString() + ' HOME'}
          </span>
          &nbsp;=&nbsp;
          {!exchangeRate
            ? 'exchange not available'
            : exchangeRate.toString() + ' USDC'}
        </div>
      </Fragment>
    );
  };

  const renderSuccessContent = (amount, handleClose) => {
    return (
      <MessagePanel
        firstMessage="You withdrew"
        firstValue={`${amount} HOME`}
        secondMessage="and got"
        secondValue={`${exchangeRate} USDC`}
        onClose={handleClose}
      />
    );
  };

  const disabledWarningContent = (
    <span>
      There isn’t enough money available to make this exchange. Please try a
      smaller amount or help solve this problem by depositing on{' '}
      <a
        href="https://curve.fi/#/ethereum/pools/factory-v2-123/"
        target="_blank"
      >
        Curve
      </a>
      .
    </span>
  );

  return (
    <ContractValueActionPanel
      hintContent={renderHintContent}
      infoContent="You can only exchange unboosted HOME"
      valueTooHighContent="You don't have that much unboosted HOME. Wait for your Boosts to finish and withdraw first."
      disabledWarningContent={disabledWarningContent}
      successContent={renderSuccessContent}
      actionButtonLabel="Exchange"
      valueStore={unstakedHomeStore}
      startTransaction={beginWithdraw}
      transactionStateStore={withdrawHomeTransactionStateStore}
      isDisabled={!exchangeRate}
      isActive={isActivePage}
      onChange={onTextChange}
    />
  );
};

export default WithdrawForm;
