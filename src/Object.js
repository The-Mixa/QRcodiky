import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { refresh } from './refresh'; // Импортируем функцию refresh

const ObjectDetails = ({ refreshToken }) => {
  const { objectId } = useParams(); // Получаем objectId из URL
  const [objectStatus, setObjectStatus] = useState(null);
  const [workHistory, setWorkHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для получения access_token
  const getAccessToken = () => {
    try {
      const accessToken = refresh(localStorage.getItem("refresh_token")); // Синхронный вызов
      return accessToken;
    } catch (error) {
      throw new Error('Ошибка при обновлении access_token');
    }
  };

  // Функция для получения данных о статусе объекта
  const fetchObjectStatus = async () => {
    try {
      const accessToken = getAccessToken(); // Синхронный вызов
      console.log(accessToken);

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/object/status/${objectId}/`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`, // Добавляем access_token в заголовок
          },
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных о статусе объекта');
      }

      const data = await response.json();
      setObjectStatus(data);
    } catch (error) {
      setError(error.message);
    }
  };

  // Функция для получения истории работ
  const fetchWorkHistory = async () => {
    try {
      const accessToken = getAccessToken(); // Синхронный вызов

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/object/work-history/${objectId}/`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`, // Добавляем access_token в заголовок
          },
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при загрузке истории работ');
      }

      const data = await response.json();
      setWorkHistory(data);
    } catch (error) {
      setError(error.message);
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchObjectStatus();
      await fetchWorkHistory();
      setLoading(false);
    };

    fetchData();
  }, [objectId]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div>
      <h1>Детали объекта</h1>
      <h2>Статус объекта</h2>
      {objectStatus && (
        <div>
          <p>Статус: {objectStatus.status}</p>
          <p>ID: {objectStatus.object.id}</p>
          <p>Название: {objectStatus.object.name}</p>
          <p>Адрес: {objectStatus.object.address}</p>
          <p>Описание задачи: {objectStatus.object.task_description}</p>
          <p>Дедлайн: {objectStatus.object.deadline}</p>
          <p>Время начала: {objectStatus.object.start_time}</p>
          <p>Время окончания: {objectStatus.object.end_time}</p>
          <p>Статистика:</p>
          <ul>
            <li>Всего выполнено работ: {objectStatus.stats.total_completed_works}</li>
            <li>Выполнено пользователем: {objectStatus.stats.user_completed_works}</li>
          </ul>
        </div>
      )}

      <h2>История работ</h2>
      {workHistory.length > 0 ? (
        <ul>
          {workHistory.map((work) => (
            <li key={work.id}>
              <p>ID работы: {work.id}</p>
              <p>Название: {work.name}</p>
              <p>Описание: {work.description}</p>
              <p>Время начала: {work.start_time}</p>
              <p>Время окончания: {work.end_time}</p>
              <p>Пользователь: {work.user}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>История работ отсутствует</p>
      )}
    </div>
  );
};

export default ObjectDetails;