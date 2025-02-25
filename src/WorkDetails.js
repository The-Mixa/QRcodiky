import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import WorkImageForm from './WorkImageForm';
import RatingComponent from './RatingComponent';
import { refresh } from './refresh';
import './App.css';

const WorkDetails = ({ refreshToken, isStaff, setTitle }) => {
  const { workId } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [showStartForm, setShowStartForm] = useState(false);
  const [formData, setFormData] = useState({
    object: '',
    name: '',
    description: ''
  });

  const getAuthHeader = async () => {
    try {
      const accessToken = refresh(refreshToken);
      return { headers: { Authorization: `Bearer ${accessToken}` } };
    } catch (error) {
      throw new Error('Ошибка авторизации');
    }
  };

  useEffect(() => {
    const fetchWorkDetails = async () => {
      try {
        const authConfig = await getAuthHeader();
        const response = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/info/${workId}/`,
          authConfig
        );
        setWork(response.data);
        setTitle(response.data.name);
        setComment(response.data.description);
        setRating(response.data.rating || 0);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkDetails();
  }, [workId, refreshToken, setTitle]);

  const handleStartWork = async () => {
    
  };

  

  const handleRateWork = async () => {
    try {
      const authConfig = await getAuthHeader();
      await axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/free-work/start/`,
        { 
          work_id: Number(workId)
        },
        authConfig
      );
      navigate(-1);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка данных о работе...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  // Если работа не начата
  if (work && work.start_time === null && !isStaff) {
    return (
      <div className="work-image-form">
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <center>
            <button onClick={handleRateWork}>Начать работу</button>
        </center>
      </div>
    )
  }

  return (
    <div className="work-details-container">
      <h1 className="work-details-title">Детали работы</h1>
      {isStaff ? (
        <div className="staff-review-section">
          <p className="comment-text">Описание от работника: {comment}</p>
          <label className="comment-label">Добавить комментарий:</label>
          <textarea
            className="textarea-comment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <RatingComponent rating={rating} setRating={setRating} />
          <button className="rate-button" onClick={handleRateWork}>
            Оценить работу
          </button>
        </div>
      ) : (
        <WorkImageForm 
          workDescription={description} 
          workId={workId} 
          refreshToken={refreshToken} 
        />
      )}
    </div>
  );
};

export default WorkDetails;