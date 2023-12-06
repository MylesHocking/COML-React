import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <h1>Welcome to Cars of My Life</h1>
      <p>
        Create and share visual timelines of the cars you've owned or dream of owning.
      </p>
      <Link to="/login"  style={{ display: 'block' }}>
        <img src="/assets/examplechart2.png" alt="Example Car Chart" style={{ cursor: 'pointer', width : '40%' }} />
      </Link>  
      <Link to="/login">
        <button className="get-started-button">
          Get Started
        </button>
      </Link>
    </div>
  );
};

export default LandingPage;
