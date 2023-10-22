import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../App.js';  

function Logout({ setIsLoggedIn, setCars }) {
  const navigate = useNavigate();
  const { setUserId, setUserInfo, refreshFromLocalStorage } = useUserContext();  

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("googleToken");
    localStorage.removeItem("user_id");
    localStorage.removeItem("userInfo");

    // Reset state using context methods
    setUserId(null);
    setUserInfo(null);
    setCars([]); 
    setIsLoggedIn(false);
    // Refresh state based on the local storage
    refreshFromLocalStorage();

    // Redirect to login or home page
    navigate('/');
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
