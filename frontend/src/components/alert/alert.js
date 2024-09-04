import React from 'react';
import './alert.css';

import alertImage from '../../assets/images/alert.png';

export const Alert = () => {
  return (
    <div className="alert-container">
      <div className="alert">
        <img src={alertImage} alt="alert" className="alert-image"></img>
        <p>
          You have unstaked HOME in your wallet. To keep earning RWA tokens
          please stake your HOME.{' '}
          <a href="/staking">Click here to get started.</a>
        </p>
      </div>
    </div>
  );
};
