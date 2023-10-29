import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../App.js';

function App() {
  const { refreshFromLocalStorage } = useUserContext();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_FLASK_API_URL;
  const oauthRedirectUri = process.env.REACT_APP_OAUTH_REDIRECT_URI;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating an async operation, you could replace this with your real checks
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  return (
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
            navigate('/chart');
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
);
}

export default App;
