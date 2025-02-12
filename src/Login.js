// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      axios.post('http://localhost:5000/login', credentials)
      .then(function(response) {
        if (response["error"] === "NoneError"){
          var refresh_token = response['refresh_token'];
          localStorage.setItem("refresh_token", refresh_token);
          console.log(refresh_token);
          navigate("/");
        }
        console.log("Invalid credentials");
        navigate("/");


      });
      
    } catch (error) {
      console.error('Ошибка при входе:', error);
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
