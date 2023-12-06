// LinkedInCallbackHandler.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useUserContext } from '../App.js';

const LinkedInCallbackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshFromLocalStorage } = useUserContext();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const user_id = params.get('user_id');
    const email = params.get('email');
    const firstname = params.get('firstname');
    const lastname = params.get('lastname');
    const profile_picture = params.get('profile_picture');
    const user_info = { id: user_id, email: email, firstname: firstname, lastname: lastname, profile_picture: profile_picture };
    
    localStorage.setItem("user_id", user_id);
    localStorage.setItem("userInfo", JSON.stringify(user_info));
    refreshFromLocalStorage();
    navigate('/chart/' + user_id);
  }, [navigate, location.search, refreshFromLocalStorage]);

  return <div>Loading...</div>;
};

export default LinkedInCallbackHandler;
