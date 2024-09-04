import React from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import './modal.css';

export const WarnModal = ({ isOpen, onClose, onContinue, type, message }) => {
  const isSuccess = type === 'success';

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="warnModal"
      contentLabel="Example Modal"
    >
      {isSuccess && (
        <>
          <h2 className="modalHeader">Caution</h2>
          <div className="warnModalContent">
            <div className="line">{message}</div>
          </div>
          <div className="warnModalButtons">
            <button className="modalContinue" onClick={onContinue}>
              Unstake
            </button>
            <button className="modalCancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      )}
    </ReactModal>
  );
};

WarnModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['success', 'failure']).isRequired,
  message: PropTypes.string,
};
