// App.js
import React , {useState, useEffect} from 'react';
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

function App() {
  const [registered, setRegistered] = useState(false);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userData, setUserData] = useState({status: "unauth"});

  useEffect(() => {
  if (localStorage.getItem("refresh_token") !== "undefined" && localStorage.getItem("refresh_token") !== null){
    setRefreshToken(localStorage.getItem("refresh_token"));
    setRegistered(true);
    var access_token = refresh(localStorage.getItem("refresh_token"));
    if (access_token != null){
    axios.get('http://localhost:8000/api/v1/auth/status/', {headers: {
        "authorization": `Bearer ${access_token}`
      }})
          .then((response) => {
            setUserData({
              status: response['data']['status']
            });
      });
    }
    }
  }, []);
  
  function make_reg_true(){
    setRegistered(true);
  }
  return (
    <Router>
      <Routes>

        <Route
          path="signup"
          element={
          <Signup
            setRegistered={make_reg_true}
            setRefreshToken={setRefreshToken}
          />
          } 
        />


        <Route
          path="login"
          element={
          <Login
            setRegistered={make_reg_true}
            setRefreshToken={setRefreshToken}
            setUserData={setUserData}
          />
          } 
        />


        <Route
          path=""
          element={
          <MainPage/>
          } 
        />


        <Route
          path="account"
          element={
          <Account
            registered={registered}
            setRegistered={setRegistered}
            setRefreshToken={setRefreshToken}
            refreshToken={refreshToken}
            userData={userData}
            setUserData={setUserData}
          />
          }
        />


        <Route
         path="camera"
          element={
          <Camera/>
          }
        />


        <Route
          path="get_by_qr/:objectId"
          element={
          <Object
          refreshToken={refreshToken}
          />
          }
        />
      </Routes>
    </Router>
  );
}



export default App; 
