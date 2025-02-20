// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
  const [registered, setRegistered] = useState(false);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userIsStaf, setUserIsStaff] = useState(false);
  const [title, setTitle] = useState('Главная страница'); // Состояние для заголовка

  useEffect(() => {
    if (localStorage.getItem("refresh_token") !== "undefined" && localStorage.getItem("refresh_token") !== null) {
      setRefreshToken(localStorage.getItem("refresh_token"));
      setRegistered(true);
      var access_token = refresh(localStorage.getItem("refresh_token"));
      if (access_token != null) {
        axios.get('http://localhost:8000/api/v1/auth/status/', {
          headers: {
            "authorization": `Bearer ${access_token}`
          }
        })
          .then((response) => {
            if (response['data']['status'] === "user")
              setUserIsStaff(false);
            else
              setUserIsStaff(true)
          });
      }
    }
  }, []);

  const handleLogOut = async () => {
    if (refreshToken) {
      try {
        await axios.post('http://localhost:8000/api/v1/auth/logout/', {
          refresh_token: refreshToken
        });

        // Сбрасываем состояние
        setRefreshToken(null);
        setRegistered(false);
        setUserIsStaff(false);
        localStorage.setItem("refresh_token", null); // Очищаем refresh_token из localStorage
      } catch (error) {
        console.error('Ошибка при выходе:', error);
      }
    }
  };

  function make_reg_true() {
    setRegistered(true);
  }

  return (
    <>
      <div className="header">
        <h3>{title}</h3> {/* Отображаем заголовок */}
      </div>
      <Router>
        <Routes>
          <Route
            path="/work/:workId"
            element={
              <WorkDetails
                isStaff={userIsStaf}
                refreshToken={refreshToken}
                setTitle={setTitle} // Передаем setTitle в компонент
              />
            }
          />

          <Route
            path="signup"
            element={
              <Signup
                setRegistered={make_reg_true}
                setRefreshToken={setRefreshToken}
                setTitle={setTitle} // Передаем setTitle в компонент
              />
            }
          />

          <Route
            path="login"
            element={
              <Login
                setRegistered={make_reg_true}
                setRefreshToken={setRefreshToken}
                setUserData={setUserIsStaff}
                setTitle={setTitle} // Передаем setTitle в компонент
              />
            }
          />

          <Route
            path=""
            element={
              <MainPage
                registered={registered}
                userIsStaff={userIsStaf}
                refreshToken={refreshToken}
                setRegistered={setRegistered}
                setRefreshToken={setRefreshToken}
                setUserData={setUserIsStaff}
                onLogOut={handleLogOut}
                setTitle={setTitle} // Передаем setTitle в компонент
              />
            }
          />

          <Route
            path="account"
            element={
              <Account
                registered={registered}
                userIsStaff={userIsStaf}
                onLogOut={handleLogOut}
                setTitle={setTitle} // Передаем setTitle в компонент
              />
            }
          />

          <Route
            path="camera"
            element={
              <Camera
                setTitle={setTitle} // Передаем setTitle в компонент
              />
            }
          />

          <Route
            path="get_by_qr/:objectId"
            element={
              <Object
                refreshToken={refreshToken}
                isStaff={userIsStaf}
                setTitle={setTitle} // Передаем setTitle в компонент
              />
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;