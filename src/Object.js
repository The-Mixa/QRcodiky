import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { refresh } from './refresh'; // Импортируем функцию refresh
import axios from 'axios';


const WorkImageForm = ({ workId, refreshToken }) => {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getAuthHeader = async () => {
    try {
      const accessToken = await refresh(refreshToken);
      return {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      };
    } catch (error) {
      throw new Error('Ошибка авторизации');
    }
  };

  // Загрузка существующих изображений при монтировании
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const authConfig = await getAuthHeader();
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/image_work/${workId}/list/`,
          authConfig
        );
        setImages(response.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchImages();
  }, [workId, refreshToken]);

  // Отправка изображения сразу при добавлении
  const handleAddImage = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const authConfig = await getAuthHeader();
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post(
        `http://127.0.0.1:8000/api/v1/image_work/${workId}/`,
        formData,
        authConfig
      );

      setImages([...images, {
        ...response.data,
        preview: URL.createObjectURL(selectedFile)
      }]);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  // Отправка описания работы
  const handleComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const authConfig = await getAuthHeader();
      await axios.post(
        'http://127.0.0.1:8000/api/v1/end/',
        { work_id: Number(workId), description },
        authConfig
      );

      alert('Работа успешно завершена!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Управление рабочими изображениями</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <form onSubmit={handleComplete}>
        <div style={{ marginBottom: '20px' }}>
          <label>
            Описание работы:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>
            Выберите изображение:
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              accept="image/*"
              style={{ marginLeft: '10px' }}
            />
          </label>
          <button 
            type="button"
            onClick={handleAddImage}
            disabled={!selectedFile || uploading}
            style={{ 
              marginLeft: '10px', 
              padding: '5px 10px', 
              fontSize: '16px',
              backgroundColor: uploading ? '#ccc' : '#28a745'
            }}
          >
            {uploading ? 'Загрузка...' : 'Добавить'}
          </button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '5px'
          }}
        >
          {loading ? 'Обработка...' : 'Завершить работу'}
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h2>Загруженные изображения:</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {images.map(image => (
            <div 
              key={image.id}
              style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}
            >
              <img 
                src={image.preview || "http://127.0.0.1:8000" + image.image} 
                alt={`Изображение ${image.id}`} 
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px' }} 
              />
              <p style={{ marginTop: '10px', fontSize: '14px' }}>
                Загружено: {new Date(image.uploaded_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const ObjectDetails = ({ refreshToken }) => {
  const { objectId } = useParams(); // Получаем objectId из URL
  const [objectStatus, setObjectStatus] = useState(null);
  const [workHistory, setWorkHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [curWorkId, setCurWorkId] = useState(null);

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
      setCurWorkId(data.work.id || null);
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
        <>
        {objectStatus.status === "busy" &&
          <p>Вы уже работаете на другом проекте</p>
        }
        {objectStatus.status !== "busy" &&

        
        <div>
          
          {objectStatus.status === "review" &&
          <p>Объект оценен</p>
          }
          {objectStatus.status === "work" &&
          <WorkImageForm workId={curWorkId} refreshToken={refreshToken}/>
          }
          
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
    } 
      </>)}
      

      <h2>История работ</h2>
      {workHistory.length > 0 ? (
        <ul>
          {workHistory.map((work) => (
            <li key={work.id}>
              <p>Название: {work.name}</p>
              <p>Описание: {work.description}</p>
              <p>Время начала: {work.start_time}</p>
              <p>Время окончания: {work.end_time}</p>
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