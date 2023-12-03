import React from 'react';

const LinkedInAuth = () => {
  const CLIENT_ID = '776aytlm7vkif8';
  const REDIRECT_URI = 'http://localhost:5000/api/linkedin/callback';
  const STATE = 'iuhfgu98dfgh98'; // This should be a unique string for each auth request
  const SCOPE = 'profile'; // Using 'r_liteprofile' and 'r_emailaddress' scopes

  const handleLogin = () => {
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}`;
    window.location.href = url;
  };

  return (
    <div>
        <button onClick={handleLogin}>Login with LinkedIn</button>
    </div>
  );
};

export default LinkedInAuth;
