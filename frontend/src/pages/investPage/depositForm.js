import { React, Fragment, useState } from 'react';
import { useStore } from '@nanostores/react';
import NumberFormat from 'react-number-format';
import '../../styles/form.css';
import '../../styles/basicStyles.css';
import {
  LoadingStatus,
  ContractValueActionPanel,
  MessagePanel,
} from '../../components';
import { etherscanUrlStore } from '../../store/appStore';

import {
  depositHome,
  depositHomeTransactionStateStore,
  lendExchangeRateStore,
  lendExchangeAmountStore,
  lendExchangeRateAmountStore,
} from '../../store/homeStore';

import {
  usdcStore,
  usdcAllowanceStore,
  approveUsdcTransfer,
  approveUsdcTransferTransactionStateStore,
} from '../../store/usdcStore';
import BigNumber from 'bignumber.js';

const DepositForm = ({ isActivePage }) => {
  const usdcValue = useStore(usdcStore);
  const usdcAllowance = useStore(usdcAllowanceStore);
  const etherscanUrl = useStore(etherscanUrlStore);
  const approveUsdcTransferTransactionState = useStore(
    approveUsdcTransferTransactionStateStore
  );
  const exchangeRate = useStore(lendExchangeRateStore);
  const exchangeRateAmount = useStore(lendExchangeRateAmountStore);
  const exchangeAmount = useStore(lendExchangeAmountStore);

  const beginDeposit = (amount) => {
    return depositHome(amount, exchangeRate);
  };

  const onTextChange = (amount) => {
    if (amount == 0) {
      amount = new BigNumber('1');
    }
    lendExchangeAmountStore.set(amount);
  };

  const renderHintContent = () => {
    return (
      <Fragment>
        <span className="titleText">
          USDC <span className="green">&rarr;</span> HOME
        </span>
        <div className="subtitleText">
          {exchangeRateAmount.toString()} USDC&nbsp;=&nbsp;
          <span className="green">
            {exchangeRate
              ? exchangeRate.toString() + ' HOME'
              : 'exchange not available'}
          </span>
        </div>
      </Fragment>
    );
  };

  const renderSuccessContent = (amount, handleContinue) => {
    return (
      <MessagePanel
        firstMessage="You exchanged"
        firstValue={`${amount} USDC`}
        secondMessage="and got"
        secondValue={`${exchangeRate} HOME`}
        onClose={handleContinue}
      />
    );
  };

  const renderInfoContent = () => {
    return (
      <span>
        You have up to
        <span className="limit-green">
          &nbsp;
          <NumberFormat
            displayType="text"
            value={usdcValue.toString()}
            thousandSeparator={true}
          />{' '}
          USDC
        </span>{' '}
        to exchange
      </span>
    );
  };

  if (!usdcAllowance || usdcAllowance.eq(new BigNumber('0'))) {
    if (approveUsdcTransferTransactionState.state === 'Base') {
      return (
        <div className="form">
          <p>
            USDC <span className="green">&rarr;</span> HOME
          </p>
          <div
            className="button centered"
            onClick={() => {
              approveUsdcTransfer();
            }}
          >
            Enable USDC
          </div>
          <div className="approvalExplaination">
            Approving this transaction allows HOME to access your USDC so you
            can make an exchange. You will always be asked to confirm any
            transfers of funds.
          </div>
        </div>
      );
    } else {
      const etherScanUrl = `${etherscanUrl}/tx/${approveUsdcTransferTransactionState.transactionHash}`;
      return (
        <div className="form">
          <p>
            USDC<span className="green">&rarr;</span> HOME
          </p>
          <LoadingStatus
            firstMessage="Waiting on Approval transaction to be confirmed"
            secondMessage="This may take a few minutes. You can view the status of your transaction"
            externalUrl={etherScanUrl}
          />
        </div>
      );
    }
  } else {
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
        infoContent={renderInfoContent}
        valueTooHighContent="You don't have enough USDC to exchange this amount. You may need to either buy more USDC or transfer USDC to this wallet."
        disabledWarningContent={disabledWarningContent}
        successContent={renderSuccessContent}
        actionButtonLabel="Exchange"
        valueStore={usdcStore}
        startTransaction={beginDeposit}
        transactionStateStore={depositHomeTransactionStateStore}
        isActive={isActivePage}
        isDisabled={!exchangeRate}
        onChange={onTextChange}
      />
    );
  }
};

export default DepositForm;
