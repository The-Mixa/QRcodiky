import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WorkList from './WorkList';
import { refresh } from './refresh';
import './App.css';

export default function HistoryPage() {
  const [works, setWorks] = useState([]);
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
    const fetchHistory = async () => {
      try {
        const authConfig = await getAuthHeader();
        const response = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/user/works/`,
          authConfig
        );
        setWorks(response.data);
      } catch (error) {
        setError(error.response?.status || 500);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="loading">Загрузка истории...</div>;

  if (error) {
    return (
      <div className="error-container">
        {error === 403 && <p>Доступ запрещен</p>}
        {error === 404 && <p>История не найдена</p>}
        <button className="link" onClick={() => window.history.back()}>
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="todo-container">
      <h2>История работ</h2>
      
      <WorkList 
        works={works}
        onWorkSelect={(id) => {/* Обработка выбора */}}
        color="#12b504"
      />
    </div>
  );
}