// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import MainPage from "./MainPage";
import Account from "./Account";
import Camera from "./CameraMy";
import Objects from "./Objects";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/account" element={<Account/>}/>
        <Route path="/camera" element={<Camera/>}/>
        <Route path="/objects" element={<Objects/>}/>
      </Routes>
    </Router>
  );
}



export default App; 
