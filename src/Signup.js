import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData["password"] === formData["confirmPassword"]){
        await axios.post('http://localhost:5000/register', formData)
        .then(function(response){
          if (response['message'] === "Registation successful"){
            axios.post('http://localhost:5000/login', formData)
            .then(function(response) {
              if (response["error"] === "NoneError"){
                var refresh_token = response['refresh_token'];
                localStorage.setItem("refresh_token", refresh_token);
                console.log(refresh_token);
                navigate("/");
              }
              console.log("Invalid credentials");
      
            });
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
