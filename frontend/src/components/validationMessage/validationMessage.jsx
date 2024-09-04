import React from 'react';
import PropTypes from 'prop-types';
import './validationMessage.css';

export const ValidationMessage = ({ message, active }) => {
  return active ? <div className="validationMessage">{message}</div> : null;
};

ValidationMessage.propTypes = {
  message: PropTypes.string,
  active: PropTypes.bool,
};
