import '../../styles/form.css';
import '../../styles/basicStyles.css';

import { useStore } from '@nanostores/react';

import NumberFormat from 'react-number-format';

import { TransactionStatePanel, MessagePanel } from '../../components';

import logo from '../../assets/images/RwaCoin_Stable-Icon_01_LightBGs_500x500.png';

import {
  startManagedTransaction,
  transactionQueueStore,
} from '../../store/transactionManager';

import {
  rwaCoinAccruedStore,
  claimBoostRwaRewardsTransaction,
} from '../../store/rwaStore';

export const RwaRewardsForm = ({}) => {
  const totalRwaRewards = useStore(rwaCoinAccruedStore);
  const transactions = useStore(transactionQueueStore);

  const transactionMarker = 'HomeRewardsTransaction';
  const transactionState = transactions
    ? transactions.find((transaction) => {
        return (
          transaction.active && transaction.uiData.marker === transactionMarker
        );
      })
    : null;

  const claimRwa = () => {
    startManagedTransaction(claimBoostRwaRewardsTransaction, {
      action: 'Claimed',
      amount: totalRwaRewards,
      marker: transactionMarker,
    });
  };

  const renderSuccessContent = (uiData, handleClose) => {
    return (
      <MessagePanel
        firstMessage={`You ${uiData.action}`}
        firstValue={`${uiData.amount.toFixed()} RWA`}
        onClose={handleClose}
      />
    );
  };

  if (transactionState) {
    return (
      <div className="form">
        <TransactionStatePanel
          className="rwaRewardsTransactionPanel"
          transactionState={transactionState}
          successContent={renderSuccessContent}
        />
      </div>
    );
  } else {
    return (
      <div className="form">
        <img src={logo} className="logo-form" alt="rwa logo" />
        <div className="balanceRow">
          <div>Unclaimed RWA</div>
          <div className="balanceAmount">
            <NumberFormat
              displayType="text"
              value={totalRwaRewards.toFixed()}
              thousandSeparator={true}
              decimalScale={4}
            />
          </div>
        </div>
        <div className="noteText">RWA rewards for Boosting HOME.</div>
        <div className="noteText">
          More RWA rewards in <a href="/farming">Farming</a>
        </div>
        <button
          className="button centered claim"
          onClick={() => claimRwa()}
          disabled={totalRwaRewards.isZero()}
        >
          <div className="buttonText">Claim</div>
        </button>
      </div>
    );
  }
};

export default RwaRewardsForm;
