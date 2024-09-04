import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@nanostores/react';

import NumberFormat from 'react-number-format';

import '../../styles/form.css';
import '../../styles/basicStyles.css';
import '../../styles/boostPanel.css';

import { unstakedHomeStore } from '../../store/homeStore';

import { add, fromUnixTime, format } from 'date-fns';

import { HomeValueEditor, MessagePanel } from '../../components';
import { currentBlockTimestampStore } from '../../store/currentBlockStore';

const NewBoostPanel = ({ level, rate, onNewBoostClick }) => {
  const boostableHome = useStore(unstakedHomeStore);
  const currentBlockTimestamp = useStore(currentBlockTimestampStore);

  if (!currentBlockTimestamp) {
    return <div>Loading...</div>;
  }

  const daysDuration = level === 1 ? 90 : 365;

  const currentDate = fromUnixTime(currentBlockTimestamp);
  const boostDate = add(currentDate, { days: daysDuration });

  const formattedBoostDate = format(boostDate, 'MMM d, yyyy');

  const getValueTooHighContent = () => {
    return (
      <p>
        You don't have that much Home to boost.{' '}
        <Link to="/?subPage=deposit">Get More</Link>
      </p>
    );
  };

  const l1Reward = (
    <NumberFormat
      className="boostPanelRight"
      displayType="text"
      value={rate.shiftedBy(2).toString()}
      decimalScale={2}
      fixedDecimalScale
      suffix="%"
    />
  );

  const l2Reward = (
    <div className="boostPanelRight">
      Max Reward
      <br />
      <span className="rateSubheader">
        (Currently&nbsp;
        <NumberFormat
          displayType="text"
          value={rate.shiftedBy(2).toString()}
          decimalScale={2}
          fixedDecimalScale
          suffix="%"
        />
        )
      </span>
    </div>
  );

  return (
    <div className="boostPanel newBoostPanel">
      <div className="boostPanelContents">
        <div className="boostPanelCenter">Level {level}</div>

        <div className="boostPanelLeft">Reward:</div>
        {level === 2 ? l2Reward : l1Reward}
        <div className="boostPanelLeft">RWA:</div>
        <div className="boostPanelRight">{level}X</div>

        <div className="boostPanelLeft">End Date:</div>
        <div className="boostPanelRight">{formattedBoostDate}</div>

        <HomeValueEditor
          className="boostPanelCenter"
          maxValue={boostableHome}
          valueTooHighContent={getValueTooHighContent()}
          buttonLabel={'Boost until ' + formattedBoostDate}
          onButtonClick={(amount) => {
            onNewBoostClick(amount);
          }}
        />
      </div>
    </div>
  );
};

export default NewBoostPanel;
