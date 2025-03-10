import React, { useState } from 'react';
import axios from 'axios';
import { refresh } from './refresh';
import './App.css';

const WorkList = ({ works, isStaff, onWorkSelect, color = '#4CAF50' }) => {
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
          <p><strong>Описание:</strong> {details.description || 'Нет описания'}</p>
          {details.rating && <p><strong>Рейтинг:</strong> {details.rating}/5</p>}
          <p><strong>Дата начала:</strong> {new Date(details.start_time).toLocaleDateString()}</p>
          {details.end_time && 
            <p><strong>Дата завершения:</strong> {new Date(details.end_time).toLocaleDateString()}</p>}
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
                  <div style={{minWidth: "20px", minHeight: "20px", maxHeight: "20px", marginTop: "20px", marginRight: "20px", backgroundColor: color, borderRadius: "10px"}}></div>
                  <div>
                    <h3 className="work-name">{work.name}</h3>
                    <p className="object-name">
                      {work.object?.name || 'Объект не указан'}
                    </p>
                  </div>
                  
                </div>
                
                <div className="work-meta">
                  {work.rating && (
                    <div className="rating-badge">
                      ★ {work.rating}
                    </div>
                  )}
                </div>
              </div>

              {expandedWork === work.id && (
                <div className="work-details-expanded">
                  {loadingDetails ? (
                    <div className="loading-details">
                      <div className="spinner"></div>
                      Загрузка данных...
                    </div>
                  ) : renderWorkDetails(work.id)}
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