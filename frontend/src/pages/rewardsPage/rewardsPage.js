import { useState, Fragment } from 'react';

import '../../styles/basicStyles.css';
import '../../styles/investorInterface.css';

import RwaRewardsForm from './rwaRewardsForm';
import HomeRewardsForm from './homeRewardsForm';

export const RewardsPage = ({}) => {
  return (
    <div className="investorInterface">
      <div className="investorInterfaceBody centered">
        <div className="investorInterfaceContainer">
          <div
            className="interfaceContainerOuterBorder"
            style={{ backgroundColor: 'var(--color-purple)' }}
          >
            <div className="interfaceContainerInnerBorder">
              <span>
                <RwaRewardsForm />
                <HomeRewardsForm />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
