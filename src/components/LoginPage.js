import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../App.js';

const LinkedInAuth = () => {
  const CLIENT_ID = '776aytlm7vkif8';
  const REDIRECT_URI = 'http://localhost:5000/api/linkedin/callback';
  const STATE = 'iuhfgu98dfgh98';
  const SCOPE = 'openid profile email';

  const handleLinkedInLogin = () => {
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}`;
    window.location.href = url;
  };

  return (
    <div>
      <button onClick={handleLinkedInLogin}>Log in with LinkedIn</button>
    </div>
  );
};

function App() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');   
  const { refreshFromLocalStorage } = useUserContext();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_FLASK_API_URL;
  const oauthRedirectUri = process.env.REACT_APP_OAUTH_REDIRECT_URI;
  const [isLoading, setIsLoading] = useState(true);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    // Implement your login logic here
    
    console.log('Email:', email, 'Password:', password);
    //: POST request to login API endpoint
    try {
      const response = await axios.post(`${apiUrl}/api/login`, {
        email, password
      });
      // Handle response
      console.log('Server response:', response);
      const { user_info } = response.data;
      console.log("User info:", user_info);
      // Save user_info in the local state or local storage
      localStorage.setItem("user_id", user_info.id);  // <-- Store user ID here
      localStorage.setItem("userInfo", JSON.stringify(user_info));
      refreshFromLocalStorage();
      // push to user's chart page
      navigate('/chart/' + user_info.id);
    } catch (error) {
      console.error('Server error:', error);
    
      // Check if the error response is from the server and has a status code
      if (error.response) {
        // If it's a conflict error, handle it
        if (error.response.status === 409) {
          console.log('Conflict error:', error.response.data.message);
          alert('The username or email already exists. Please use a different one.');        
        } else {
          console.log('Error response:', error.response);
          alert('Failed to log in.'); // You might want to use a more specific message based on the error
        }
      } else if (error.request) {
        console.log('Request error:', error.request);
        alert('No response received from the server.');
      } else {
        console.log('Error:', error.message);
        alert('An error occurred.');
      }
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <>
          <form onSubmit={handleLoginSubmit}>
            <input 
              className="input-field" 
              type="text" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              className="input-field" 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className='button' type="submit">Login</button>
          </form>
        <div className="divider"><span>or signup via email</span></div>
          <div>
              <Link to="/signup">Sign up</Link>
          </div>
        <div className="divider"><span>or login with LinkedIn</span></div>
          <LinkedInAuth /> {/* Use LinkedInAuth component here */}
        <div className="divider"><span>OR - Google SSO (test beta - dm myleshocking@gmail.com for access)</span></div>
      </>
      
      <div className="google-login-container">
        {isLoading ? (
          <div className="placeholder">Loading...</div>
        ) : (
          <GoogleOAuthProvider
        clientId="1003699094925-sv0et1mp81ln28l24tccaosr60sbmuca.apps.googleusercontent.com"
        redirectUri={oauthRedirectUri}
        //get more scopes 
        //https://developers.google.com/identity/protocols/oauth2/scopes
        scope="https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/plus.me"
        >
        <GoogleLogin
          onSuccess={credentialResponse => {
            console.log(credentialResponse);
            const { credential } = credentialResponse;
            // Save the Google ID token in the local state or local storage.
            localStorage.setItem("googleToken", credential);
            axios.post(`${apiUrl}/api/verify_google_token`, {
              token: credentialResponse.credential
            })
            .then(response => {
              console.log("Server response:", response);
              const { user_info } = response.data;
              // Save user_info in the local state or local storage
              localStorage.setItem("user_id", user_info.id);  // <-- Store user ID here
              console.log("User info:", user_info);
              localStorage.setItem("userInfo", JSON.stringify(user_info));
              refreshFromLocalStorage(); 
              
              //console.log("localstorage User info:", localStorage.getItem("userInfo"));
              // push to chart page
              navigate('/chart/' + user_info.id);
            })
            .catch(error => {
              console.log("Server error:", error);
              // Handle error
            });
          }}
          onError={() => {
            console.log('Google Login Failed');
          }}
          />
        </GoogleOAuthProvider>
        )}
      </div>
    </div>
  );
}

export default App;
