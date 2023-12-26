import React from 'react';
import { useUserContext } from '../App.js'; 
import { performLogout } from '../utils/authUtils'; 
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();
    const { setUserId, setUserInfo, setIsLoggedIn } = useUserContext();

    const handleLogout = () => {
        performLogout(setUserId, setUserInfo, setIsLoggedIn, navigate);
    };    

  return (
    <div className="logout-container">
      <h1>Goodbye, Friend!</h1>
      <p>Thanks for spending time with us. Hope to see you again soon.</p>
      <button className="get-started-button" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Logout;
