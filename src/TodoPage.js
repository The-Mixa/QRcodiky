import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WorkList from './WorkList';
import WorkListReview from './WorkListReview';
import { refresh } from './refresh';
import './App.css';

export default function TodoPage({ isStaff }) {
  const [tasks, setTasks] = useState([]);
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
    const fetchTasks = async () => {
      try {
        const authConfig = await getAuthHeader();
        const response = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/user/todo/`,
          authConfig
        );
        setTasks(response.data);
      } catch (error) {
        setError(error.response?.status || 500);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div className="loading">Загрузка задач...</div>;

  if (error) {
    return (
      <div className="error-container">
        {error === 404 && <p>Задачи не найдены</p>}
        {error === 403 && <p>Доступ запрещен</p>}
        <button className="link" onClick={() => window.history.back()}>
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="todo-container">
      
      
      {isStaff ? (
        <>
        <h2>Все работы на оценку</h2>
        <WorkListReview 
          canMakeAction={false}
          works={tasks.filter(work => work.end_time && work.start_time && !work.review)}
          onWorkSelect={(id) => {/* Обработка выбора */}}
        />
        </>
      ) : (
        <>
        <h2>Все задачи</h2>
        <WorkList 
          canMakeAction={false}
          works={tasks.filter(work => !work.end_time && )}
          onWorkSelect={(id) => {/* Обработка выбора */}}
          color="red
          " 
        />
        </>
      )}
    </div>
  );
}