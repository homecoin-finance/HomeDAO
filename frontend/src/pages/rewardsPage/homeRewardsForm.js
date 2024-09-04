import { useStore } from '@nanostores/react';

import NumberFormat from 'react-number-format';

import { TransactionStatePanel, MessagePanel } from '../../components';

import '../../styles/form.css';
import '../../styles/basicStyles.css';

import homeLogo from '../../assets/images/HomeCoin_icon_02_500x500.png';

import {
  homeHoldingRewardsStore,
  claimHomeHoldingRewardsTransaction,
} from '../../store/homeStore';

import {
  startManagedTransaction,
  transactionQueueStore,
} from '../../store/transactionManager';

export const HomeRewardsForm = ({}) => {
  const totalHomeRewards = useStore(homeHoldingRewardsStore);
  const transactions = useStore(transactionQueueStore);

  const transactionMarker = 'RwaRewardsTransaction';
  const transactionState = transactions
    ? transactions.find((transaction) => {
        return (
          transaction.active && transaction.uiData.marker === transactionMarker
        );
      })
    : null;

  const claimHome = () => {
    console.log('claim home');
    startManagedTransaction(claimHomeHoldingRewardsTransaction, {
      action: 'Claimed',
      amount: totalHomeRewards,
      marker: transactionMarker,
    });
  };

  const renderSuccessContent = (uiData, handleClose) => {
    return (
      <MessagePanel
        firstMessage={`You ${uiData.action}`}
        firstValue={`${uiData.amount.toFixed()} HOME`}
        onClose={handleClose}
      />
    );
  };

  if (transactionState) {
    return (
      <div className="form">
        <TransactionStatePanel
          className="homeRewardsTransactionPanel"
          transactionState={transactionState}
          successContent={renderSuccessContent}
        />
      </div>
    );
  } else {
    return (
      <div className="form">
        <img src={homeLogo} className="logo-form" alt="home logo" />
        <div className="balanceRow">
          <div>Unclaimed HOME</div>
          <div className="balanceAmount">
            <NumberFormat
              displayType="text"
              value={totalHomeRewards.toFixed()}
              thousandSeparator={true}
              decimalScale={4}
            />
          </div>
        </div>
        <div className="noteText">Rewards for holding HOME.</div>
        <div className="noteText">
          More HOME rewards in <a href="/?subPage=myboosts">My Boosts</a>
        </div>
        <button
          className="button centered claim"
          onClick={() => claimHome({})}
          disabled={totalHomeRewards.isZero()}
        >
          <div className="buttonText">Claim</div>
        </button>
      </div>
    );
  }
};

export default HomeRewardsForm;
