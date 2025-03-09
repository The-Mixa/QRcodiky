import React, { useState } from 'react';
import axios from 'axios';
import { refresh } from './refresh';

const Signup = ({ onSuccess, switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(formData.password !== formData.confirmPassword) {
        throw new Error('Пароли не совпадают');
      }

      await axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/auth/register/`,
        {
          username: formData.username,
          password: formData.password
        }
      );

      // Автоматический вход после регистрации
      const loginResponse = await axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/auth/login/`,
        {
          username: formData.username,
          password: formData.password
        }
      );

      localStorage.setItem("refresh_token", loginResponse.data.refresh_token);
      const accessToken = await refresh(loginResponse.data.refresh_token);
      
      if(accessToken) {
        const statusResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/auth/status/`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        onSuccess(statusResponse.data.status !== "user");
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
    }
  };

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit}>
        <h1 className='form-heading'>Регистрация</h1>
        
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Повторите пароль"
          onChange={handleChange}
          required
        />
        <button type="submit" className="link">
          Зарегистрироваться
        </button>
        
        <div className="form-footer">
          <span>Уже есть аккаунт? </span>
          <button type="button" onClick={switchToLogin} className="text-button">
            Войти
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;