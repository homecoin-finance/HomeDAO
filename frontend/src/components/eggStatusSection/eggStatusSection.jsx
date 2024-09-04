import React from 'react';
import { Spinner } from '..';
import { abbreviateNumber } from '../../utils';
import './eggStatusSection.css';

export const EggStatusSection = ({ eggs, loading, borrowed }) => {
  const numberOfHomes = eggs.length;
  let statusValues = {
    eggValue: 0,
    homeValue: 0,
    borrowed: 0,
  };

  eggs.forEach((egg) => {
    statusValues = {
      eggValue: statusValues.eggValue + parseFloat(egg.value),
      homeValue: statusValues.homeValue + parseFloat(egg.home_value),
      borrowed: borrowed,
    };
  });

  const formattedHomes = abbreviateNumber(numberOfHomes);
  const formattedEggValue = abbreviateNumber(statusValues.eggValue);
  const formattedHomeValue = abbreviateNumber(statusValues.homeValue);
  const formattedBorrowedValue = abbreviateNumber(statusValues.borrowed);

  return (
    <div className="eggStatusSection">
      {/* <img alt="header" className="eggsHeader" src={eggsHeader} /> */}
      <h1 className="eggStatusSectionTitle">Homes</h1>
      <h1 className="eggStatusSectionTitle mobile">Homes</h1>
      <div className="eggStatusSectionBoxes">
        {!loading ? (
          <>
            <div className="box">
              <div className="value">{formattedHomes}</div>
              <div className="label">
                {numberOfHomes > 1 ? 'Homes' : 'Home'}
              </div>
            </div>
            <div className="box">
              <div className="value">${formattedEggValue}</div>
              <div className="label">Liens</div>
            </div>
            <div className="box">
              <div className="value">${formattedBorrowedValue}</div>
              <div className="label">Borrowed</div>
            </div>
            <div className="box">
              <div className="value">${formattedHomeValue}</div>
              <div className="label">Home Value</div>
            </div>
          </>
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
};
