// ShareForm.js
import React, { useState } from 'react';
import './ShareForm.css';

const ShareForm = ({ isOpen, onClose, sendShareEmails }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('Chiggidy-Check out my car-chart and join the exclusive community at carsofmy.life!');

  // Add more states if you want to collect multiple emails

  const handleSubmit = (e) => {
    console.log('In handleSubmit');
    e.preventDefault();
    sendShareEmails(email, message); // Pass the email and message to the function
    onClose(); // Close the modal after sending
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>Share Your Car-Chart</h2>
          <img src="/assets/example-chart.jpg" alt="Example Car-Chart" className="example-chart-image" />
          <textarea
            className="textarea-invite"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Friend's email"
            required
          />
          <button type="submit" className="share-form-button get-started-button">Send Invite</button>
          <button onClick={onClose} className="share-form-button">Close</button>
        </form>
      </div>
    </div>
  );
};

export default ShareForm;