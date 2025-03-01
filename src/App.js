import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom'; // Добавлен Link
import Signup from './Signup';
import Login from './Login';
import MainPage from "./MainPage";
import Account from "./Account";
import Camera from "./CameraMy";
import Object from "./Object";
import './App.css';
import { refresh } from './refresh';
import axios from 'axios';
import WorkDetails from './WorkDetails';

function App() {
  
  const [userIsStaf, setUserIsStaff] = useState(false);
  const [title, setTitle] = useState('Главная страница');
  const [register, setRegistered] = useState(true);

  useEffect(() => {
    const fetchUserStatus = async () => {
      const refreshToken = localStorage.getItem("refresh_token");
  
      if (refreshToken && refreshToken !== "undefined" && refreshToken !== "null") {
        try {
          const access_token = await refresh(refreshToken);
  
          if (access_token) {
            const response = await axios.get(`${process.env.REACT_APP_HOST}/api/v1/auth/status/`, {
              headers: {
                "Authorization": `Bearer ${access_token}`
              }
            });

            if (response.data.status === "user") {
              setUserIsStaff(false);
            } else {
              setUserIsStaff(true);
            }
          }
        } catch (error) {
          console.error("Ошибка при получении статуса пользователя:", error);
        }
      }
    };
  
    fetchUserStatus();
  }, []);

  const handleLogOut = () => {
    if (localStorage.getItem("refresh_token")) {
      try {
        axios.post(`${process.env.REACT_APP_HOST}/api/v1/auth/logout/`, {
          refresh_token: localStorage.getItem("refresh_token")
        });

        setUserIsStaff(false);
        localStorage.setItem("refresh_token", null);
        setRegistered(false);
      } catch (error) {
        console.error('Ошибка при выходе:', error);
      }
    }
  };

  

  return (
    <>
      <div className="header">
        <h3>{title}</h3>
      </div>
      <Router>
        <Routes>
          <Route
            path="/work/:workId"
            element={
              <WorkDetails
                isStaff={userIsStaf}
                setTitle={setTitle}
              />
            }
          />

          <Route
            path="signup"
            element={
              <Signup
                setTitle={setTitle}
              />
            }
          />

          <Route
            path="login"
            element={
              <Login
                setUserData={setUserIsStaff}
                setTitle={setTitle}
              />
            }
          />

          <Route
            path=""
            element={
              <MainPage
                userIsStaff={userIsStaf}
                setUserData={setUserIsStaff}
                onLogOut={handleLogOut}
                setTitle={setTitle}
              />
            }
          />

          <Route
            path="camera"
            element={
              <Camera
                setTitle={setTitle}
              />
            }
          />

          <Route
            path="get_by_qr/:objectId"
            element={
              <Object
                isStaff={userIsStaf}
                setTitle={setTitle}
                setUserIsStaff={setUserIsStaff}
              />
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;