import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import WorkImageForm from './WorkImageForm';
import RatingComponent from './RatingComponent';
import { refresh } from './refresh';
import './App.css';

const WorkDetails = ({isStaff, setTitle }) => {
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
      const accessToken = await refresh(localStorage.getItem("refresh_token"));
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
        setComment(response.data.worker_comment);
        setRating(response.data.rating || 0);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkDetails();
  }, [workId, setTitle]);

  const handleStartWork = async () => {
    try {
      const authConfig = await getAuthHeader();
      await axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/free-work/start/`,
        { 
          work_id: Number(workId)
        },
        authConfig
      );
      navigate(-1); // Возвращаемся на предыдущую страницу
    } catch (error) {
      setError(error.status);
    }
  };

  const handleRateWork = async () => {
    try {
        const authConfig = await getAuthHeader();
        await axios.post(
          `${process.env.REACT_APP_HOST}/api/v1/review/${workId}/`,
          { 
            work: workId,
            rating: rating, 
            comment: description, 
          },
          authConfig
        );
        navigate(-1); // Возвращаемся на предыдущую страницу
    } catch (error) {
        setError(error.status);
    }
};

  if (loading) {
    return <div className="loading">Загрузка данных о работе...</div>;
  }

  if (error) {
    return (<>
      {error === 400 && <p>На объекте уже работают</p>}
      <center>
      <button  className="link" onClick={() => navigate(-1)}>На главную</button>
      </center>

    </>)
  }

  // Если работа не начата
  if (work && work.start_time === null && !isStaff) {
    return (
      <div className="work-image-form" style={{backgroundColor: "lightgrey"}}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        
          <h2>Информация о работе</h2>
          <p><b>Объект: </b>{work.object.name}</p>
          <p><b>Адрес: </b>{work.object.address}</p>
          <p><b>Описание объекта: </b>{work.object.task_description}</p>
          <p><b>Название работы: </b>{work.name}</p>
          <p><b>Описание работы: </b>{work.description}</p>
          <p><b>Выполнил:</b>{work.user.fullname}</p>
        <center>
          <button className='link' onClick={handleStartWork}>Начать работу</button>
        </center>
      </div>
    );
  }

  return (
    <div className="work-details-container">
      <button onClick={() => navigate(-1)} className='link back-button'>&lt;</button>
      <br/>
      <h1 className="work-details-title">Детали работы</h1>
      {isStaff ? (
        <div className="staff-review-section">
          {work.images.length > 0 && (
                  <div className="images">
                    {work.images.map((image) => (
                      <img key={image.id} src={image.image} alt={`Work image ${image.id}`} />
                    ))}
                  </div>
                )}
                <h2>Информация о работе</h2>
          <p><b>Объект: </b>{work.object.name}</p>
          <p><b>Адрес: </b>{work.object.address}</p>
          <p><b>Описание объекта: </b>{work.object.task_description}</p>
          <p><b>Название работы: </b>{work.name}</p>
          <p><b>Описание работы: </b>{work.description}</p>
          <p><b>Выполнил:</b>{work.user.fullname}</p>

          <p className="comment-text"><b>Комментарий от работника:</b> {comment}</p>
          <label className="comment-label"><b>Добавить комментарий к оценке:</b></label>
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
        />
      )}
    </div>
  );
};

export default WorkDetails;
