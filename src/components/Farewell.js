import React from 'react';
import { useEffect } from 'react';
import { useUserContext } from '../App.js';
import { performLogout } from '../utils/authUtils';
import { Link } from 'react-router-dom';

const Farewell = () => {
    const { setUserId, setUserInfo, setIsLoggedIn } = useUserContext();

    useEffect(() => {
        performLogout(setUserId, setUserInfo, setIsLoggedIn, null, false);
    }, [setUserId, setUserInfo, setIsLoggedIn]);

    return (
        <div className="farewell-container" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center' 
        }}>
            <h1  >Safe Travels!</h1>
            <p style={{ width : '80%' }}>
            As you venture into new horizons, cherish the cars and memories we've shared; every vehicle, more than mere metal, was a companion on your journey, a silent witness to your stories, and a partner in the adventures that shaped your soul. We're grateful for your place in our family, and as you steer towards your next chapter, always remember: each road carries a tale
            </p>
            
            <Link to="/"  style={{ display: 'block' }}>
                <img src="/assets/farewell.jpg" alt="Farewell driver" style={{ width : '80%' }} />
            </Link>  
        </div>
    );
};

export default Farewell;