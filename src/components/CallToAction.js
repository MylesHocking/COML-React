import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <div className="cta-container">
      <h1>Join Us!</h1>
      <p>To access this feature, please register or log in.</p>
      <Link to="/signup"><button className='button'>Sign Up</button></Link>
      <Link to="/login"><button className='button'>Login</button></Link>
    </div>
  );
};

export default CallToAction;