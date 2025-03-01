import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import WorkList from './WorkList';
import WorkListReview from './WorkListReview';
import WorkImageForm from './WorkImageForm';
import { refresh, registered } from './refresh';

const ObjectDetails = ({isStaff, setTitle, setUserIsStaff }) => {
  const navigate = useNavigate();
  const { objectId } = useParams();
  const [objectStatus, setObjectStatus] = useState(null);

  const [activeTask, setActiveTask] = useState(null);  // Инициализация состояния для activeTask
  const [worksWithoutReviews, setWorksWithoutReviews] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [currentTasks, setCurrentTasks] = useState([]); // Текущие задачи
  const [workersInfo, setWorkersInfo] = useState({});
  const [workHistory, setWorkHistory] = useState([]); // История работ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    object_id: objectId,
    name: '',
    description: ''
  });

  const getAuthHeader = () => {
    try {
      const accessToken = refresh(localStorage.getItem("refresh_token"));
      return { headers: { Authorization: `Bearer ${accessToken}` } };
    } catch (error) {
      throw new Error('Ошибка авторизации');
    }
  };

  const handleCompleteTask = () => {
    setActiveTask(null);  // Убираем активную задачу
    setAvailableTasks(prev => prev.filter(t => t.id !== activeTask?.id));  // Убираем завершённую задачу из списка доступных
  };

  const handleInputChange = (e) => {
    setNewTaskData({
      ...newTaskData,
      [e.target.name]: e.target.value
    });
  };

  // Отправка новой задачи на сервер
  const handleCreateTask = async () => {
    try {
      const authConfig =  getAuthHeader();
      const response =  axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/start/`,
        {
          object: objectId,
          name: newTaskData.name,
          description: newTaskData.description,
        },
        authConfig
      );
      setAvailableTasks(prev => [...prev, response.data]);  // Добавляем новую задачу в список
      setShowCreateForm(false);  // Закрываем форму
      setNewTaskData({
        object_id: objectId,
        name: '',
        description: ''
      });  // Очищаем поля формы
    } catch (error) {
      setError(error.response?.data?.message || error.message);  // Обрабатываем ошибку
    }
  };

  // Проверка роли пользователя (проверка на прораба или работника)
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const accessToken = await refresh(localStorage.getItem("refresh_token"));
        if (!accessToken || !registered()) return;
        
        const response = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/auth/status/`,
          { "headers": { "Authorization": `Bearer ${accessToken}` } }
        );
        setUserIsStaff(response.data.status !== "user");
      } catch (error) {
        console.error('Ошибка проверки статуса:', error);
      }
    };

    fetchUserStatus();
  });


  useEffect(() => {
  if (isStaff){
    const fetchData = async () => {
      try {
        const authConfig =  getAuthHeader();
        
        const  statusResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/object/status/${objectId}/`,
          authConfig
        );
        setObjectStatus(statusResponse.data);
        setTitle(statusResponse.data.object.name);

        // Загрузка работ, на которые можно оставить отзывы
        const worksWithoutReviewsResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/object/works_without_reviews/${objectId}/`,
          authConfig
        );
        setWorksWithoutReviews(worksWithoutReviewsResponse.data);  // Работы без отзывов

        // Загрузка истории работ
        const historyResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/object/work-history/${objectId}/`,
          authConfig
        );
        setWorkHistory(historyResponse.data); // Сохраняем историю работ

        // Получаем доступные задачи и текущие задачи
        const userWorksResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/object/work-history/${objectId}/`,
          authConfig
        );
        
        const current = userWorksResponse.data.filter((work) => work.start_time && !work.end_time); // Текущие задачи
        setCurrentTasks(current);

        userWorksResponse.data = userWorksResponse.data.filter((work) => {return work.end_time === null});
        if (userWorksResponse.data.length === 0 || userWorksResponse.status === 404) {
          const freeWorksResponse =  axios.get(
            `${process.env.REACT_APP_HOST}/api/v1/object/work-free/${objectId}`,
            authConfig
          );
          const avaliable = freeWorksResponse.data.filter((work) => !work.start_time && !work.end_time);
          setAvailableTasks(avaliable);
        } else {
          const active = userWorksResponse.data.find(work => 
            work.start_date && !work.end_date
          );
          setActiveTask(active || null);
          const avaliable = userWorksResponse.data.filter((work) => !work.start_time && !work.end_time);
          setAvailableTasks(avaliable);
        }

        // Получаем информацию о рабочих
        const workers = {};
        for (let work of [...worksWithoutReviewsResponse.data, ...userWorksResponse.data]) {
          if (work.user) {
            const workerResponse = await axios.get(
              `${process.env.REACT_APP_HOST}/api/v1/user/info/${work.user}/`,
              authConfig
            );
            workers[work.id] = workerResponse.data.username;
          }
        }
        setWorkersInfo(workers);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }
  }, [objectId, setTitle, navigate, isStaff]);



useEffect(() => {
  if (!isStaff){
    const fetchData = async () => {
      try {
        const authConfig =  getAuthHeader();
        
        const statusResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/object/status/${objectId}/`,
          authConfig
        );
        setObjectStatus(statusResponse.data);
        setTitle(statusResponse.data.object.name);

        // Загрузка истории работ
        const historyResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/object/work-history/${objectId}/`,
          authConfig
        );
        setWorkHistory(historyResponse.data); // Сохраняем историю работ

        // Получаем доступные задачи и текущие задачи
        const userWorksResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/object/work-history/${objectId}/`,
          authConfig
        );
        
        const current = userWorksResponse.data.filter((work) => work.start_time && !work.end_time); // Текущие задачи
        setCurrentTasks(current);

        userWorksResponse.data = userWorksResponse.data.filter((work) => {return work.end_time === null});
        if (userWorksResponse.data.length === 0 || userWorksResponse.status === 404) {
          const freeWorksResponse =  await axios.get(
            `${process.env.REACT_APP_HOST}/api/v1/object/work-free/${objectId}`,
            authConfig
          );
          const avaliable = freeWorksResponse.data.filter((work) => !work.start_time && !work.end_time);
          setAvailableTasks(avaliable);
        } else {
          const active = userWorksResponse.data.find(work => 
            work.start_date && !work.end_date
          );
          setActiveTask(active || null);
          const avaliable = userWorksResponse.data.filter((work) => !work.start_time && !work.end_time);
          setAvailableTasks(avaliable);
        }
      } catch (error) {
        console.error(error);
        setError(error.response?.status || 500);
        setTitle("Ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }
  }, [objectId, setTitle, navigate, isStaff]);

  if (loading) return <div className="loading">Загрузка данных...</div>;

  if (error) {
    return (
      <div className="error-container">
        {error === 404 && <p>Объект не найден</p>}
        {error === 403 && <p>Доступ запрещен</p>}
        {error === 401 && <p>Требуется авторизация</p>}
        <center>
          <NavLink to="/" className="link">На главную</NavLink>
        </center>
      </div>
    );
  }

  return (
    <div className="object-details">
      {objectStatus && (
        <div className="object-info">
          <h2>{objectStatus.object.name}</h2>
          <p>Адрес: {objectStatus.object.address}</p>
          <p>Статус объекта: {objectStatus.status}</p>
        </div>
      )}
  
      {isStaff ? (
        <div className="foreman-interface">
          {worksWithoutReviews.length > 0 ? (
            <>
              <center><h3>Работы на оценку</h3></center>
              <WorkListReview works={worksWithoutReviews} isStaff={true} />
            </>
          ) : (
            <center>
              <div className="empty-state">
                <p>Нет работ на оценку</p>
                <p>История работ по этому объекту пуста</p>
              </div>
            </center>
          )}
        </div>
      ) : (
        <div className="worker-interface">
          {currentTasks.length > 0? (
            <WorkImageForm 
              workId={currentTasks[0].id}
              onComplete={handleCompleteTask}
            />
          ) : (
            <div className="tasks-section">
              {availableTasks.length > 0 ? (
                <>
                  <center><h3>Доступные задачи</h3></center>
                  <WorkList works={availableTasks} isStaff={false} />
                </>
              ) : (
                <div className="no-tasks">
                  {showCreateForm ? (
                    <form className="work-form">
                    <center>
                      <h4>Создать новую задачу</h4>
                    </center>
                      <div className="form-group">
                        <label className="form-label">Название:</label> 
                        <input
                          className="form-input"
                          type="text"
                          name="name"
                          value={newTaskData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Описание:</label>
                        <textarea
                          className="form-textarea"
                          name="description"
                          value={newTaskData.description}
                          onChange={handleInputChange}
                          rows="3"
                        />
                      </div>
                      <div className="form-actions">
                        <button 
                          onClick={handleCreateTask}
                          className="submit-btn"
                          disabled={!newTaskData.name}
                        >
                          Создать
                        </button>
                        <button 
                          onClick={() => setShowCreateForm(false)}
                          className="cancel-btn"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p>Нет доступных задач</p>
                      <button 
                        onClick={() => setShowCreateForm(true)}
                        className="link"
                      >
                        Создать новую задачу
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* История работ */}
      <div className="work-history">
        {workHistory.length > 0 && (
          <>
            <center><h3>История работ</h3></center>
            {workHistory.map((work) => (
              <div key={work.id} className="work-item">
                <p><b>Название: </b>{work.name || "Без названия"}</p>
                <p><b>Описание: </b>{work.description || "Нет описания"}</p>
                {work.images.length > 0 && (
                  <div className="images">
                    {work.images.map((image) => (
                      <img key={image.id} src={image.image} alt={`Work image ${image.id}`} />
                    ))}
                  </div>
                )}
                {work.review && (
                  <div className="review">
                    <p><b>Оценка: </b>{work.review.rating}</p>
                    <p><b>Комментарий: </b>{work.review.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ObjectDetails;
