import React, { useEffect } from 'react';

const FacebookSignIn = ({ onFacebookLogin }) => {
    useEffect(() => {
        // Load Facebook SDK
        window.fbAsyncInit = function() {
            window.FB.init({
                appId      : '160187100512891', // Replace with your Facebook App ID
                cookie     : true,
                xfbml      : true,
                version    : 'v14.0' // Use latest version
            });
            window.FB.AppEvents.logPageView();
        };

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const handleFBLogin = () => {
        window.FB.login(response => {
            if (response.authResponse) {
                console.log('Welcome! Fetching your information.... ');
                window.FB.api('/me', {fields: 'name,email,picture'}, function(response) {
                    console.log('Good to see you, ' + response.name + '.');
                    onFacebookLogin(response);
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {scope: 'email,public_profile'});
    };

    return (
        <button onClick={handleFBLogin}>Login with Facebook</button>
    );
};

export default FacebookSignIn;
