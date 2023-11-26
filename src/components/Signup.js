import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../App.js';

const Signup = () => {
    const apiUrl = process.env.REACT_APP_FLASK_API_URL;
  const { refreshFromLocalStorage } = useUserContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');

  const handleSubmit = async (e) => {
    //debug
    console.log("in handle submit");
    console.log("email:", email);
    e.preventDefault();
    // Add frontend validation if needed
    try {
        const response = await axios.post(`${apiUrl}/api/signup`, {
            email, password, firstname, lastname
        });
        // Handle response
        console.log("Response received");
        console.log('Server response:', response);
        const { user_info } = response.data;
        // Save user_info in the local state or local storage
        localStorage.setItem("user_id", user_info.id);  // <-- Store user ID here
        console.log("User info:", user_info);
        localStorage.setItem("userInfo", JSON.stringify(user_info));
        refreshFromLocalStorage();
        // push to chart page with user id
        navigate('/chart/' + user_info.id);
    } catch (error) {
        console.error('Server error:', error);
      
        if (error.response) {
          // If the server responded with a 409 status code, it means the user already exists
          if (error.response.status === 409) {
            console.log('Conflict error:', error.response.data.message);
            alert('The username or email already exists. Please use a different one.');
          } else {
            // Handle other possible responses (e.g., 500 Internal Server Error)
            console.log('Error response:', error.response);
            alert('Failed to sign up. ' + error.response.data.message);
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.log('Request error:', error.request);
          alert('No response received from the server. Please try again later.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error:', error.message);
          alert('An error occurred. Please try again.');
        }
    }      
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign Up</h1>  
      <input type="text" className="input-field" value={firstname} onChange={(e) => setFirstname(e.target.value)} required placeholder="First Name" />
      <input type="text" className="input-field" value={lastname} onChange={(e) => setLastname(e.target.value)} required placeholder="Last Name" />
      <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" />
      <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
      <button className='button' type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
