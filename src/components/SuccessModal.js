// components/SuccessModal.js
import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, message, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="success-modal">
      <div className="success-modal-content">
        {message && <p>{message}</p>}
        {children}
        <button className='button' onClick={onClose}>close</button>
      </div>
    </div>
  );
};

export default SuccessModal;