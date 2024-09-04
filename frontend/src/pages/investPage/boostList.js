import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@nanostores/react';

import BigNumber from 'bignumber.js';

import '../../styles/form.css';
import '../../styles/basicStyles.css';
import '../../styles/boostPanel.css';

import NumberFormat from 'react-number-format';
import { Toggle } from '../../components';

import { add, fromUnixTime, format } from 'date-fns';

import { currentBlockTimestampStore } from '../../store/currentBlockStore';

const BoostItem = ({
  boost,
  onClaimClick,
  onToggleAutoRenewClick,
  onWithdrawClick,
}) => {
  const currentBlockTimestamp = useStore(currentBlockTimestampStore);
  // TODO probably need an collapsed state?
  const rewardDate = fromUnixTime(boost.nextRewardTimestamp);
  const formattedRewardDate = format(rewardDate, 'MMM d, yyyy');
  const availableRewards = boost.totalRewards
    .minus(boost.claimedRewards)
    .decimalPlaces(2);
  const claimDisabled = availableRewards.isEqualTo(new BigNumber('0'));

  const withdrawDisabled =
    boost.isAutoRenew || boost.nextRewardTimestamp >= currentBlockTimestamp;

  return (
    <div className="boostItem">
      <div className="boostItemData">
        <div className="boostItemLabel">Amount</div>
        <NumberFormat
          displayType="text"
          value={boost.principal.toString()}
          thousandSeparator={true}
          decimalScale={2}
          fixedDecimalScale
        />
        <div className="boostItemLabel">Return</div>
        <NumberFormat
          displayType="text"
          value={boost.apy.shiftedBy(2).toString()}
          decimalScale={2}
          fixedDecimalScale
          suffix="%"
        />
        <div className="boostItemLabel">
          {boost.isAutoRenew ? 'Renew Date' : 'End Date'}
        </div>
        <span className="boostItemDate">{formattedRewardDate}</span>
        <div className="boostItemLabel">Available rewards</div>
        <NumberFormat
          displayType="text"
          value={availableRewards.toString()}
          thousandSeparator={true}
          decimalScale={2}
          fixedDecimalScale
        />
      </div>
      <div className="boostItemButtons">
        <button
          className="button"
          onClick={() => {
            onClaimClick(boost.id);
          }}
          disabled={claimDisabled}
        >
          Claim
        </button>
        <button
          className="button"
          onClick={() => {
            onWithdrawClick(boost.id);
          }}
          disabled={withdrawDisabled}
        >
          Withdraw
        </button>
        <div className="renewGroup">
          <span>Auto-Renew</span>
          <Toggle
            className="renewToggle"
            checked={boost.isAutoRenew}
            onChange={() => {
              onToggleAutoRenewClick(boost.id);
            }}
          />
        </div>
      </div>
    </div>
  );
};

const BoostList = ({
  boosts,
  onClaimClick,
  onToggleAutoRenewClick,
  onWithdrawClick,
}) => {
  // const currentDate = fromUnixTime(currentBlockTimestamp);
  // const boostDate = add(currentDate, { days: daysDuration });

  // const formattedBoostDate = format(boostDate, 'MMM d, yyyy');

  let sorted = boosts.sort(
    (a, b) => a.nextRewardTimestamp - b.nextRewardTimestamp
  );
  const boostItems = sorted.map((boost) => {
    return (
      <BoostItem
        key={boost.id}
        boost={boost}
        onClaimClick={onClaimClick}
        onToggleAutoRenewClick={onToggleAutoRenewClick}
        onWithdrawClick={onWithdrawClick}
      />
    );
  });

  return (
    <div className="boostList boostPanel">
      <div className="boostListHeader">
        <div className="boostListTitle">My Boosts</div>
        {/*<div className="boostListNext">Next {boost.isAutoRenew ? "Renew Date" : "End Date"}: </div>*/}
      </div>
      {boostItems}
    </div>
  );
};

export default BoostList;
