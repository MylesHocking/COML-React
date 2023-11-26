import React, { useEffect, useState, createContext, useContext, useCallback, lazy, Suspense} from 'react';
import { BrowserRouter as Router, Route, Routes,Link} from 'react-router-dom';
import { fetchCars } from './utils/api.js';
import logo from './assets/images/transparent_logo.png';
import LandingPage from './components/LandingPage';
import ShareForm from './components/ShareForm';
import './App.css';


const AddCar = lazy(() => import('./components/AddCar'));
const CarChart = lazy(() => import('./components/CarChart'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const Logout = lazy(() => import('./components/Logout'));
const Signup = lazy(() => import('./components/Signup'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const UserList = lazy(() => import('./components/UserList'));
const EventFeed = lazy(() => import('./components/Events'));

export const UserContext = createContext();
export function useUserContext() {
  return useContext(UserContext);
}

export const CarContext = createContext();

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cars, setCars] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [showShareForm, setShowShareForm] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const onShareClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    setShowShareForm(true); // Open the ShareForm modal
  };

  const sendShareEmails = async (email, message) => {
    console.log('In sendShareEmails');
    const recipients = email.split(','); // Assuming emails are comma-separated
    const body = JSON.stringify({ recipients, message });
  
    try {
      const response = await fetch('http://localhost:5000/api/share_chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const responseData = await response.json();
      console.log('Success:', responseData);
      alert('Emails sent successfully!'); // Show a success message
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send emails.'); // Show an error message
    }
  };
  

  const fetchCarsForUser = useCallback(async (userId = null) => {
    if (!userId) return;
    console.log('In fetchCarsForUser');
    const carData = await fetchCars(userId);
    console.log('Received carData:', carData);
    setCars(carData);
  }, []);  

  // Add this function inside App.js
  const refreshFromLocalStorage = () => {
    const storedUserId = localStorage.getItem('user_id');
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
      setIsLoggedIn(true);
    }
  };

  // Modify your existing useEffect to use the new function
  useEffect(() => {
    //console.log('useEffect running', userId, userInfo);

    const handleStorageChange = (e) => {
      if (e.key === "user_id" || e.key === "userInfo") {
        refreshFromLocalStorage();
      }
    };

    // Initial setup from local storage
    refreshFromLocalStorage();

    // Listen to changes to local storage
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [userId, userInfo]);

  // Second useEffect to get cars when userId changes
  useEffect(() => {
    fetchCarsForUser();
  }, [userId, fetchCarsForUser]);


  const carValue = {
    cars,
    setCars,
    fetchCarsForUser
  };
  
  const userValue = {
    userInfo,
    setUserInfo,
    userId,
    setUserId,
    isLoggedIn,
    setIsLoggedIn,
    refreshFromLocalStorage
  };

  //console.log("Current userInfo state:", userInfo);

  return (
        
    <CarContext.Provider value={carValue}>
      <UserContext.Provider value={userValue}>
        <Router>
          <div className="App">
           
            <div className="main-container"> 
              <header>
                <nav className="nav-container">
                  <button 
                    className="burger-menu" 
                    onClick={() => {
                      setIsNavExpanded(!isNavExpanded);
                      console.log("Nav expanded:", !isNavExpanded);
                    }}
                  >
                    ☰
                  </button>
                  <Link to="/">
                    <img src={logo} alt="Cars of My Life Logo" className="logo" />
                  </Link>
                  <div className={`nav-links ${isNavExpanded ? 'expanded' : ''}`}>
                    <div className="nav-links-left">
                      <Link to="/add-car" onClick={() => setIsNavExpanded(false)}>Add</Link>
                      <Link to={`/chart/${userId}`} onClick={() => setIsNavExpanded(false)}>Chart</Link>
                      <Link to="/userlist" onClick={() => setIsNavExpanded(false)}>Chums</Link>
                      <Link to="/events" onClick={() => setIsNavExpanded(false)}>Feed</Link>
                    </div>
                    <div className="nav-links-right">
                      {userInfo ? (
                        <>
                          <Link to="/" onClick={onShareClick}>Share</Link>
                          <Link to="/logout" onClick={() => setIsNavExpanded(false)}>{JSON.parse(userInfo).firstname} (logout)</Link>
                        </>
                      ) : (
                        <Link to="/login" onClick={() => setIsNavExpanded(false)}>Login</Link>
                      )}
                    </div>
                  </div>
                </nav>
                <div className="chrome-pipe"></div>
                <div className="chrome-pipe2"></div>
              </header>

              <div className="chrome-bar"></div>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/chart/:userId" element={
                      <>
                        <CarChart cars={cars} fetchCarsForUser={fetchCarsForUser} userId={userId} />  {/* Include the CarChart here */}
                      </>
                    } /> 
                    <Route path="/add-car" element={<AddCar cars={cars} fetchCarsForUser={fetchCarsForUser} />} />    
                    <Route path="/userlist" element={<UserList />} />  
                    <Route path="/events" element={<EventFeed />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/logout" element={<Logout setIsLoggedIn={setIsLoggedIn} setCars={setCars}  />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                  </Routes>
                </Suspense>
                <footer className="footer">
                  <Link to="/privacy-policy">Privacy Policy</Link> <Link to="/terms-of-service">Terms of Service</Link>
                </footer>
                <ShareForm
                  isOpen={showShareForm}
                  onClose={() => setShowShareForm(false)}
                  sendShareEmails={sendShareEmails}
                />
            </div>
          </div>
        </Router>
      </UserContext.Provider>
    </CarContext.Provider>
  );
}

export default App;