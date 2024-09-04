import React from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import './modal.css';

export const Modal = ({
  isOpen,
  onClose,
  type,
  firstMessage,
  firstValue,
  secondMessage,
  secondValue,
}) => {
  const isSuccess = type === 'success';

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      contentLabel="Example Modal"
    >
      {isSuccess && (
        <>
          <h2 className="modalHeader">Congratulations!</h2>
          <div className="modalContent">
            <div className="line">{firstMessage}</div>
            <div className="value first">{firstValue}</div>
            <div className="line">{secondMessage}</div>
            <div className="value second">{secondValue}</div>
          </div>
          <button className="modalConfirmation" onClick={onClose}>
            OK
          </button>
        </>
      )}
    </ReactModal>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['success', 'failure']).isRequired,
  firstMessage: PropTypes.string,
  firstValue: PropTypes.string,
  secondMessage: PropTypes.string,
  secondValue: PropTypes.string,
};
