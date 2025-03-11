import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { refresh } from './refresh';
import "./App.css";


const Login = ({ onSuccess, switchToSignup }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/auth/login/`,
        credentials
      );
      
      localStorage.setItem("refresh_token", response.data.refresh_token);
      const accessToken = await refresh(response.data.refresh_token);
      
      if(accessToken) {
        const statusResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/auth/status/`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        onSuccess(statusResponse.data.status !== "user");
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Ошибка авторизации');
    }
  };

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit} className='auth-form'>
        <h3 className='form-heading'>Вход</h3>
        
        {error && <div className="form-error">{error}</div>}
        
        <input
          type="text"
          name="username"
          placeholder="Юзернейм"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          onChange={handleChange}
          required
        />
        <button type="submit" className="link light-blue">
          Войти
        </button>
        
        <div className="form-footer">
          <span>Нет аккаунта? </span>
          <button type="button" onClick={switchToSignup} className="text-button">
            Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;