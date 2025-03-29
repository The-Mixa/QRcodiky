import React, { useState } from 'react';
import axios from 'axios';
import { refresh } from './refresh';
import './App.css';
import arrow from "./unwrap-green 1.svg";
import ImageGallery from './ImageGalery';

const WorkList = ({ works, isStaff, onWorkSelect, color = '#4CAF50', onWorkStart, canMakeAction = true}) => {
  const [expandedWork, setExpandedWork] = useState(null);
  const [workDetails, setWorkDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeader = async () => {
    try {
      const accessToken = await refresh(localStorage.getItem("refresh_token"));
      return { headers: { Authorization: `Bearer ${accessToken}` } };
    } catch (error) {
      throw new Error('Ошибка авторизации');
    }
  };

  const handleStartWork = async (workId) => {
    try {
      const authConfig = await getAuthHeader();
      await axios.patch(
        `${process.env.REACT_APP_HOST}/api/v1/start/${workId}/`,
        {},
        authConfig
      );
      
      const updatedDetails = { 
        ...workDetails[workId], 
        start_time: new Date().toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '.')
      };
      setWorkDetails(prev => ({ ...prev, [workId]: updatedDetails }));
      
      // Уведомляем родительский компонент
      if(onWorkStart) onWorkStart();
    } catch (error) {
      console.error('Error starting work:', error);
      setError('Ошибка при старте работы');
    }
  };

  const handleWorkClick = async (workId) => {
    try {
      setError(null);
      
      if (expandedWork === workId) {
        setExpandedWork(null);
        return;
      }

      setLoadingDetails(true);
      
      const authConfig = await getAuthHeader();
      const response = await axios.get(
        `${process.env.REACT_APP_HOST}/api/v1/info/${workId}/`,
        authConfig
      );
      
      setWorkDetails(prev => ({
        ...prev,
        [workId]: response.data
      }));
      setExpandedWork(workId);
    } catch (error) {
      console.error('Error fetching work details:', error);
      setError('Ошибка загрузки данных');
      setExpandedWork(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderWorkDetails = (workId) => {
    const details = workDetails[workId];
    if (!details) return null;

    return (
      <div className="work-details-content">
        <div className="work-info-section">
          <p><strong>Адрес:</strong> {details.object?.address || 'Не указан'}</p>
          {details.start_time &&
          <p><strong>Дата начала:</strong> {details?.start_time.substring(0, 10) || "Не указано"}</p>
          }
          {!details.start_time && !isStaff && canMakeAction &&
            <button 
              className="start-work-button"
              onClick={() => handleStartWork(workId)}
            >
              Начать работу
            </button>
          
          }
          {details.end_time && 
            <p><strong>Дата завершения:</strong> {details?.end_time.substring(0, 10) || "Не указано"}</p>}
          <p><strong>Описание:</strong> {details.description || 'Нет описания'}</p>
          
          {details.review && (
            <>
              <p><strong>Комментарий прораба:</strong> {details.review.comment || 'Без комментария'}</p>
              {details.review?.rating && (
                    <div className="rating-badge">
                      ★ {details.review.rating}
                    </div>
                  )}
              
              {details.images && details.images.length > 0 && (
                <div className="work-images-container">
                  <strong>Фотографии работ:</strong>
                  <div className="work-images-grid">
                    {details.images.map(image => (
                      <ImageGallery
                        key={image.id} 
                        src={image.url} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="work-list-container">
      {error && <div className="error-message">{error}</div>}
      
      {works.length > 0 ? (
        <ul className="work-list">
          {works.map((work) => (
            <li 
              key={work.id}
              className={`work-item ${expandedWork === work.id ? 'expanded' : ''}`}
            >
              <div 
                className="work-summary"
                onClick={() => handleWorkClick(work.id)}
              >
                <div 
                  className="color-marker"
                  style={{ backgroundColor: color }}
                  title={isStaff ? 'Работа прораба' : 'Ваша работа'}
                ></div>
                
                <div className="work-main-info">
                  <div style={{
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "space-around"
                  }}>
                    <div style={{
                      minWidth: "20px",
                      minHeight: "20px",
                      maxHeight: "20px",
                      marginRight: "20px",
                      backgroundColor: color,
                      borderRadius: "10px"
                    }}></div>
                  </div>
                  <div style={{width: "100%"}}>
                    <h3 className="work-name">{work.name}</h3>
                    <p className="object-name">
                      {work.object?.name || 'Объект не указан'}
                    </p>
                  </div>
                  <div className='arrow-container' style={{
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "space-around"
                  }}>
                    <img src={arrow} alt="Стрелка раскрытия"></img>
                  </div>
                </div>
                
                  
                </div>

              {expandedWork === work.id && (
                <div className="work-details-expanded">
                  <div className="details-content">
                    {loadingDetails ? (
                      <div className="loading-details">Загрузка...</div>
                    ) : renderWorkDetails(work.id)}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="work-list-empty">Работы отсутствуют</p>
      )}
    </div>
  );
};

export default WorkList;