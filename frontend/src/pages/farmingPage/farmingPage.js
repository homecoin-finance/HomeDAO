import React, { useState, Fragment } from 'react';
import { useStore } from '@nanostores/react';

import BigNumber from 'bignumber.js';

import '../../styles/basicStyles.css';
import '../../styles/investorInterface.css';
import '../../styles/farmingPage.css';

import NumberFormat from 'react-number-format';

import {
  HomeValueEditor,
  TransactionStatePanel,
  MessagePanel,
} from '../../components';

import {
  lpTokenNames,
  lpTokenStores,
  approveLPTokenTransaction,
  stakeLPTokenTransaction,
  unstakeLPTokenTransaction,
  claimLPTokenRewardsTransaction,
} from '../../store/lpStore';
import {
  startManagedTransaction,
  transactionQueueStore,
} from '../../store/transactionManager';

import loadingImage from '../../assets/images/loading.gif';
import '../../components/loadingStatus/loadingStatus.css';

import uni from '../../assets/images/uni.png';
import sushi from '../../assets/images/sushi.png';
import curve from '../../assets/images/curve.png';

const poolUIData = {
  sushiBaconEth: {
    name: 'SUSHI - BACON <> ETH',
    nickname: 'Sushi LP',
    logo: sushi,
  },
  curveHome3crv: {
    name: 'CURVE - HOME <> 3CRV',
    nickname: 'Curve LP',
    logo: curve,
  },
};

const availablePools = lpTokenNames.map((keyName) => {
  return {
    keyName: keyName,
    ...poolUIData[keyName],
  };
});

function LPValueEditor({
  maxValue,
  buttonLabel,
  decimals,
  valueTooHighContent,
  onCommit,
}) {
  const [actionValue, setActionValue] = useState(new BigNumber('0'));

  function handleClick() {
    onCommit && onCommit(actionValue);
  }

  return (
    <Fragment>
      <HomeValueEditor
        onHomeValueChange={(newValue) => {
          setActionValue(newValue);
        }}
        maxValue={maxValue}
        valueTooHighContent={valueTooHighContent}
        buttonLabel={buttonLabel}
        onButtonClick={handleClick}
        decimals={decimals}
      />
    </Fragment>
  );
}

function FarmingPage(props) {
  const [selectedPool, setSelectedPool] = useState(0);
  const selectedPoolInfo = availablePools[selectedPool];
  const tokenKey = selectedPoolInfo.keyName;
  const selectedPoolAddress = useStore(lpTokenStores[tokenKey].addressStore);
  const lpDecimals = useStore(lpTokenStores[tokenKey].decimalStore).toNumber();
  const unstakedToken = useStore(lpTokenStores[tokenKey].unstakedStore);
  const stakedToken = useStore(lpTokenStores[tokenKey].stakedStore);
  const unclaimedRewards = useStore(lpTokenStores[tokenKey].rewardsStore);
  const poolApproved = useStore(lpTokenStores[tokenKey].approvedStore);
  const [formTab, setFormTab] = useState(
    selectedPoolInfo.keyName !== 'sushiBaconEth' ? 0 : 1
  );
  const transactions = useStore(transactionQueueStore);

  // Need this all the time to hide the tab that has Sushi-Bacon-Eth.
  // As soon as that's gone, this store can go too.
  const sbeStaked = useStore(lpTokenStores['sushiBaconEth'].stakedStore);

  // Only show a transaction if it is active and has our active tokenKey
  // Transactions for other LP tokens will be shown on their respective tab
  const transactionState = transactions
    ? transactions.find((transaction) => {
        return transaction.active && transaction.uiData.tokenKey === tokenKey;
      })
    : null;

  function approveLPToken() {
    startManagedTransaction(approveLPTokenTransaction, {
      tokenKey,
      action: 'Approved',
      tokenName: selectedPoolInfo.nickname,
    });
  }

  function stakeLPToken(amount) {
    startManagedTransaction(stakeLPTokenTransaction, {
      tokenKey,
      amount,
      action: 'Staked',
      tokenName: selectedPoolInfo.nickname,
    });
  }

  function unstakeLPToken(amount) {
    startManagedTransaction(unstakeLPTokenTransaction, {
      tokenKey,
      amount,
      action: 'Unstaked',
      tokenName: selectedPoolInfo.nickname,
    });
  }

  function claimLPTokenRewards() {
    startManagedTransaction(claimLPTokenRewardsTransaction, {
      tokenKey,
      amount: unclaimedRewards,
      action: 'Claimed',
      tokenName: 'RWA',
    });
  }

  function renderApproveTabs() {
    return (
      <div className="approveForm">
        <div className="approveTabs">
          <div className="approveTab">
            <div className="approveCircle circle">1</div>
            Enable {selectedPoolInfo.nickname}
          </div>
          <div className="depositTab">
            <div className="depositCircle circle">2</div>
            Deposit
          </div>
        </div>
        <div className="approveButtonContainer">
          <button
            className="approveButton button"
            onClick={() => approveLPToken()}
            data-testid="allow-LP-access"
          >
            Enable {selectedPoolInfo.nickname}
          </button>
          <div className="explainationText">
            Approving this transaction allows HOME to access your{' '}
            {selectedPoolInfo.nickname}
            tokens so you can make a deposit. You will always be asked to
            confirm any transfers of funds.
          </div>
        </div>
      </div>
    );
  }

  function renderFarmingForms() {
    return (
      <div className="farmingFormContainer">
        <div className="farmingTabsContainer">
          <button
            className={
              formTab === 0 ? 'farmingTabActive' : 'farmingTabInactive'
            }
            onClick={() => setFormTab(0)}
            disabled={selectedPoolInfo.keyName === 'sushiBaconEth'}
          >
            Deposit
          </button>
          <button
            className={
              formTab === 1
                ? 'farmingTabActive middleTab'
                : 'farmingTabInactive middleTab'
            }
            data-testid="switch-withdraw"
            onClick={() => setFormTab(1)}
          >
            Withdraw
          </button>
          <button
            className={
              formTab === 2 ? 'farmingTabActive' : 'farmingTabInactive'
            }
            data-testid="switch-claim"
            onClick={() => setFormTab(2)}
          >
            Claim
          </button>
        </div>
        {formTab === 0 ? (
          <div className="farmingFormBottom">
            <div className="formText">
              Deposit up to&nbsp;
              <span className="formTextPurple">
                <NumberFormat
                  displayType="text"
                  value={unstakedToken.toFixed()}
                  thousandSeparator={true}
                  decimalScale={4}
                />
                &nbsp;{selectedPoolInfo.nickname}
              </span>
            </div>

            <LPValueEditor
              maxValue={unstakedToken}
              valueTooHighContent={'Not enough ' + selectedPoolInfo.nickname}
              buttonLabel={'Deposit'}
              onCommit={(amount) => {
                stakeLPToken(amount);
              }}
              decimals={lpDecimals}
            />
          </div>
        ) : (
          <div />
        )}
        {formTab === 1 ? (
          <div className="farmingFormBottom">
            <div className="formText">
              Withdraw up to&nbsp;
              <div className="formTextPurple">
                <NumberFormat
                  displayType="text"
                  value={stakedToken.toFixed()}
                  thousandSeparator={true}
                  decimalScale={4}
                />
                &nbsp;
                {selectedPoolInfo.nickname}
              </div>
            </div>
            <LPValueEditor
              maxValue={stakedToken}
              valueTooHighContent={'Not enough ' + selectedPoolInfo.nickname}
              buttonLabel={'Withdraw'}
              onCommit={(amount) => {
                unstakeLPToken(amount);
              }}
              decimals={lpDecimals}
            />
          </div>
        ) : (
          <div />
        )}
        {formTab === 2 ? (
          <div className="farmingFormBottom">
            <div className="rwaAmountText">
              <NumberFormat
                displayType="text"
                value={unclaimedRewards.toFixed()}
                thousandSeparator={true}
                decimalScale={4}
              />
              &nbsp; RWA
            </div>
            <button
              className={
                unclaimedRewards == 0
                  ? 'disabledButton'
                  : 'approveButton button'
              }
              data-testid="claim-button"
              onClick={() => claimLPTokenRewards()}
            >
              {unclaimedRewards != 0 ? 'Claim' : 'Nothing to Claim'}
            </button>
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }

  const renderSuccessContent = (uiData, handleClose) => {
    if (uiData.action === 'Approved') {
      return (
        <MessagePanel
          firstMessage={`You approved access to ${uiData.tokenName}`}
          onClose={handleClose}
        />
      );
    } else {
      return (
        <MessagePanel
          firstMessage={`You ${uiData.action}`}
          firstValue={`${uiData.amount} ${uiData.tokenName}`}
          onClose={handleClose}
        />
      );
    }
  };

  const selectPool = (key) => {
    setSelectedPool(key);
    setFormTab(availablePools[key].keyName == 'sushiBaconEth' ? 1 : 0);
  };

  return (
    <div className="investorInterface">
      <div className="investorInterfaceBody centered">
        <div className="farmingInterfaceContainer">
          <div className="farmingPoolsSection">
            <div className="farmingPoolsTitle">Farming Pools</div>
            <div className="farmingPoolList">
              {availablePools &&
                availablePools.map((pool, key) => {
                  // If the current wallet doesn't have any of a dead pool's lp tokens staked, then don't render the tab at all.
                  if (
                    pool.keyName === 'sushiBaconEth' &&
                    sbeStaked.isEqualTo(BigNumber(0))
                  ) {
                    return;
                  }

                  return (
                    <div
                      key={key}
                      className={
                        selectedPool === key
                          ? 'poolListItemActive poolListItem'
                          : 'poolListItem'
                      }
                      onClick={() => selectPool(key)}
                    >
                      <img
                        src={pool.logo}
                        alt="pool icon"
                        className="poolIcon"
                      />
                      <span className="poolName">{pool.name}</span>

                      {/* <div className="apy">
                        15.9%
                        <div className="apyLabel">APY</div>
                      </div> */}
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="farmingContainer">
            <div className="interfaceContainerInnerBorder">
              <div className="farmingForm">
                <div className="poolAccrualInfo">
                  <div className="poolTitle">
                    <img
                      src={selectedPoolInfo.logo}
                      alt="pool icon"
                      className="poolIcon"
                    />
                    <span className="poolName">{selectedPoolInfo.name}</span>
                  </div>
                  <div className="userDataSection">
                    <div className="dataLine">
                      Unstaked {selectedPoolInfo.nickname}
                      <NumberFormat
                        className="dataLineAmount"
                        displayType="text"
                        value={unstakedToken.toFixed()}
                        thousandSeparator={true}
                        decimalScale={4}
                      />
                    </div>
                    <div className="dataLine">
                      Staked {selectedPoolInfo.nickname}
                      <NumberFormat
                        className="dataLineAmount"
                        data-testid="staked-amount"
                        displayType="text"
                        value={stakedToken.toFixed()}
                        thousandSeparator={true}
                        decimalScale={4}
                      />
                    </div>
                    <div
                      className="dataLine dataLineBottom"
                      data-testid="unclaimed-amount"
                    >
                      Unclaimed RWA
                      <NumberFormat
                        className="dataLineAmount"
                        displayType="text"
                        value={unclaimedRewards.toFixed()}
                        thousandSeparator={true}
                        decimalScale={4}
                      />
                    </div>
                  </div>
                </div>
                <div className="poolAccrualInfo">
                  <div className="poolInteractionTitle">
                    Stake {selectedPoolInfo.nickname}
                  </div>
                  {transactionState ? (
                    <TransactionStatePanel
                      className="farmingTransactionPanel"
                      transactionState={transactionState}
                      successContent={renderSuccessContent}
                    />
                  ) : poolApproved.eq(0) ? (
                    renderApproveTabs()
                  ) : (
                    renderFarmingForms()
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmingPage;
