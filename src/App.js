import React, { useEffect, useState, createContext, useContext, lazy, Suspense} from 'react';
import { BrowserRouter as Router, Route, Routes,Link} from 'react-router-dom';
import { fetchCars } from './utils/api.js';
import logo from './assets/images/COMLlogosmol.png';
import LandingPage from './components/LandingPage';

const AddCar = lazy(() => import('./components/AddCar'));
const CarChart = lazy(() => import('./components/CarChart'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const Logout = lazy(() => import('./components/Logout'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));

export const UserContext = createContext();
export function useUserContext() {
  return useContext(UserContext);
}

export const CarContext = createContext();
export function CarProvider({ children }) {
  const [cars, setCars] = useState([]);
  
  const fetchCarsForUser = async (userId) => {
    if (!userId) return;
    console.log('In fetchCarsForUser');
    const carData = await fetchCars(userId);
    console.log('Received carData:', carData);
    setCars(carData);
  };

  return (
    <CarContext.Provider value={{ cars, setCars, fetchCarsForUser }}>
      {children}
    </CarContext.Provider>
  );
}

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cars, setCars] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


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
    console.log('useEffect running', userId, userInfo);

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

  const fetchCarsForUser = async () => {
    if (!userId) return;
    console.log('In fetchCarsForUser');
    const carData = await fetchCars(userId);
    console.log('Received carData:', carData);
    setCars(carData);
  };

  // Second useEffect to get cars when userId changes
  useEffect(() => {
    fetchCarsForUser();
  }, [userId]);


  const value = {
    userInfo,
    setUserInfo,
    userId,
    setUserId,
    isLoggedIn,
    setIsLoggedIn,
    cars,
    setCars,
    refreshFromLocalStorage
  };

  console.log("Current userInfo state:", userInfo);

  return (
    
    <CarProvider>
      <UserContext.Provider value={value}>
        <Router>
          <div className="App">
            <header>
              <nav className="nav-container">
                <div>
                  <Link to="/">HOME</Link> | <Link to="/add-car">ADD CAR</Link> | <Link to="/chart">CHART</Link>
                </div>
                <div>
                  {userInfo ? (
                    <span>
                      Cars of {JSON.parse(userInfo).firstname}'s Life <Link to="/logout">(logout)</Link>
                    </span>
                  ) : (
                    <Link to="/login">Login</Link>
                  )}
                </div>
              </nav>
              <img src={logo} alt="Cars of My Life Logo" className="logo" />
              <div className="chrome-pipe"></div>
              <div className="chrome-pipe2"></div>
            </header>
    
            <div className="chrome-bar"></div>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/chart" element={
                    <>
                      <CarChart cars={cars} fetchCarsForUser={fetchCarsForUser} userId={userId} />  {/* Include the CarChart here */}
                    </>
                  } /> 
                  <Route path="/add-car" element={<AddCar cars={cars} fetchCarsForUser={fetchCarsForUser} />} />    
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/logout" element={<Logout setIsLoggedIn={setIsLoggedIn} setCars={setCars}  />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                </Routes>
              </Suspense>
              <footer className="footer">
                <Link to="/privacy-policy">Privacy Policy</Link> | <Link to="/terms-of-service">Terms of Service</Link>
              </footer>
          </div>
        </Router>
      </UserContext.Provider>
    </CarProvider>
  );
}

export default App;