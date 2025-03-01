// Login.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({setUserData, setTitle}) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  });

  function getUserStatus(accessToken){
    axios.get(`${process.env.REACT_APP_HOST}/api/v1/auth/status/`, {headers: {
        "authorization": `Bearer ${accessToken}`
    }})
        .then((response) => {
          if (response['data']['status'] === "user")
            setUserData(false);
          else
            setUserData(true);
    });
    
  }

  useEffect(() => setTitle("Вход в аккаунт"));


  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_HOST}/api/v1/auth/login/`, credentials);
      
      if (response['data']["error"] === undefined) {
        var refresh_token = response['data']['refresh_token'];
        localStorage.setItem("refresh_token", refresh_token);
        getUserStatus(response['data']['access_token']);
        navigate("/");
      } else {
        alert("Invalid credentials");
      }
  
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Неверный пароль");
      } else {
        console.error('Ошибка при входе:', error);
      }
    }
  };
  

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit}>
      <h1 className='form-heading'>Вход</h1>

        <input type="text" name="username" placeholder="Юзернейм или почта" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Пароль" onChange={handleChange} required />
        <button type="submit">Войти</button>
        <p className="form-link">        
          нету аккаунта? <a  href="/signup">Зарегестрироваться</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
