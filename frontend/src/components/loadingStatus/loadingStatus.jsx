import React from 'react';
import PropTypes from 'prop-types';
import loadingImage from '../../assets/images/loading.gif';
import './loadingStatus.css';

export const LoadingStatus = ({ firstMessage, secondMessage, externalUrl }) => {
  return (
    <>
      <p className="loadingStatus">{firstMessage}</p>
      <span className="loadingStatus loadingStatusCentered">
        {secondMessage}{' '}
        {externalUrl && (
          <a
            href={externalUrl}
            className="loadingStatusExternalLink"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
        )}
      </span>
      <img src={loadingImage} alt="loading bar" className="loadingBar" />
    </>
  );
};

LoadingStatus.propTypes = {
  firstMessage: PropTypes.string.isRequired,
  secondMessage: PropTypes.string.isRequired,
  externalUrl: PropTypes.string,
};
