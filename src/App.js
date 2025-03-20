// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainPage from "./MainPage";
import Login from "./Login";
import Signup from "./Signup";
import { refresh, registered } from "./refresh";
import './App.css';

function App() {
  const [userIsStaf, setUserIsStaff] = useState(false);
  const [showLogin, setShowLogin] = useState(!registered());
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (registered()) checkAuthStatus();
  }, []);

  useEffect(() => {
    document.title = 'Yasmin';
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accessToken = await refresh(localStorage.getItem("refresh_token"));
      const response = await axios.get(
        `${process.env.REACT_APP_HOST}/api/v1/auth/status/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setUserIsStaff(response.data.status !== "user");
    } catch (error) {
      handleLogOut();
    }
  };

  const handleAuthSuccess = () => {
    setShowLogin(false);
    setShowSignup(false);
    checkAuthStatus();
  };
  
  const handleLogOut = () => {
    localStorage.removeItem("refresh_token");
    setShowLogin(true);
    setUserIsStaff(false);
  };

  return (
    <div className="app-container">
      {showLogin && (
        <Login 
          onSuccess={handleAuthSuccess}
          switchToSignup={() => { setShowLogin(false); setShowSignup(true); }}
        />
      )}

      {showSignup && (
        <Signup 
          onSuccess={handleAuthSuccess}
          switchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
        />
      )}

      {!showLogin && !showSignup && (
        <MainPage 
          isStaff={userIsStaf}
          onLogOut={handleLogOut}
        />
      )}
    </div>
  );
}

export default App;