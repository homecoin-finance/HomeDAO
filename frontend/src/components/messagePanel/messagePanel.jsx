import { React, Fragment, useState, useRef } from 'react';

import './messagePanel.css';

export const MessagePanel = ({
  title,
  firstMessage,
  firstValue,
  secondMessage,
  secondValue,
  onClose,
}) => {
  return (
    <div className="message">
      <h2 className="messageHeader">{title}</h2>
      <div className="messageContent">
        <div className="line">{firstMessage}</div>
        <div className="value first">{firstValue}</div>
        <div className="line">{secondMessage}</div>
        <div className="value second">{secondValue}</div>
      </div>
      <button className="messageConfirmation button" onClick={onClose}>
        OK
      </button>
    </div>
  );
};
