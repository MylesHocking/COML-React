// components/SuccessModal.js
import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default SuccessModal;