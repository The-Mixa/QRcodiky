// App.js
import React , {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import MainPage from "./MainPage";
import Account from "./Account";
import Camera from "./CameraMy";
import Objects from "./Objects";
import './App.css';

function App() {
  const [registered, setRegistered] = useState(false);
  const [refreshToken, setRefreshToken] = useState(null);
  
  function make_reg_true(){
    setRegistered(true);
  }
  return (
    <Router>
      <Routes>

        <Route
          path="/signup"
          element={
          <Signup
            setRegistered={make_reg_true}
            setRefreshToken={setRefreshToken}
          />
          } 
        />


        <Route
          path="/login"
          element={
          <Login
            setRegistered={make_reg_true}
            setRefreshToken={setRefreshToken}
          />
          } 
        />


        <Route
          path="/"
          element={
          <MainPage/>
          } 
        />


        <Route
          path="/account"
          element={
          <Account
            registered={registered}
            setRegistered={setRegistered}
            setRefreshToken={setRefreshToken}
            refreshToken={refreshToken}
          />
          }
        />


        <Route
         path="/camera"
          element={
          <Camera/>
          }
        />


        <Route
          path="/objects"
          element={
          <Objects/>
          }
        />
      </Routes>
    </Router>
  );
}



export default App; 
