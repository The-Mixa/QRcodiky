import React, { useEffect, useState } from 'react';
import './App.css';
import { refresh } from './refresh';
import axios from 'axios';

export default function Account({ onLogOut }) {
const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = async () => {
    try {
      const accessToken = await refresh(localStorage.getItem("refresh_token"));
      return { headers: { Authorization: `Bearer ${accessToken}` } };
    } catch (error) {
      throw new Error('Ошибка авторизации');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authConfig = await getAuthHeader();
        const response = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/user/myinfo/`,
          authConfig
        );
        setUserData(response.data);
      } catch (error) {
        console.error(error);
        setError(error.response?.status || 500);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="loading">Загрузка профиля...</div>;

  if (error) {
    return (
      <div className="error-container">
        {error === 403 && <p>Доступ запрещен</p>}
        {error === 404 && <p>Профиль не найден</p>}
        
      </div>
    );
  }

  return (
    <>
    <center><h1>Профиль</h1></center>
    <div className="profile-container">
            
        <div className="work-item object-info">
        <h2 style={{margin: "0px"}}>Имя</h2>
        <div style={{padding: "10px", paddingTop: "0px", paddingBottom: "6px"}}>
          <p>{userData.fullname || 'Не указано'}</p>
        </div>
        </div>

        <div className="work-item object-info">
        <h2 style={{margin: "0px"}}>Никнейм</h2>
        <div style={{padding: "10px", paddingTop: "0px", paddingBottom: "6px"}}>
          <p>{userData.username}</p>
          </div>
        </div>

        <div className="work-item object-info">
          <h2 style={{margin: "0px"}}>Ваш рейтинг</h2>
          <div style={{padding: "10px", paddingTop: "0px", paddingBottom: "6px"}}>
            <p>{userData.rating || '0.0'} /5.0</p>
          </div>
        </div>
      </div>
      <center>
      <button className='out-button' onClick={onLogOut}>Выйти из аккаунта</button>
      </center>
      </>
  );
}
