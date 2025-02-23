import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Signup = ({setRegistered, setRefreshToken, registered}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const logIn = async () => {
    await axios.post(`http://${process.env.REACT_APP_HOST}:8000/api/v1/auth/login/`, {"username": formData['username'], "password": formData['password']})
        .then((response) => {
          console.log(response);
          if (response['data']['refresh_token'] !== undefined){
            setRefreshToken(response['data']['refresh_token']);
            localStorage.setItem("refresh_token", response['data']['refresh_token']);
            navigate('/');
          };
        });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData["password"] === formData["confirmPassword"]){
        await axios.post(`http://${process.env.REACT_APP_HOST}:8000/api/v1/auth/register/`, {"username": formData['username'], "password": formData['password']})
        .then(async (response) => {
          if (response['data']['message'] === "User registred successfully"){
            setRegistered(true);
            await logIn();
          }
          
        });
      }
      else{
        alert("Пароли не совпадают");
      }
      
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
    }
    
  };

  return (
    <div className='form-container'>

      <form onSubmit={handleSubmit}>
      <h1 className='form-heading'>Регистрация</h1>

  
        <input type="text" name="username" placeholder="Юзернейм" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Пароль" onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Подтверждение пароля" onChange={handleChange} required />
        <button type="submit">Зарегистрироваться</button>
        <p className="form-link">        
          уже есть аккаунт? <a href="/login">Войти</a>
        </p>
    </form>
    </div>
  );
}

export default Signup;
