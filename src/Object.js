import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import WorkList from './WorkList';
import WorkImageForm from './WorkImageForm';
import { refresh } from './refresh';

const ObjectDetails = ({ refreshToken, isStaff, setTitle, registered, setUserIsStaff }) => {
  const navigate = useNavigate();
  const { objectId } = useParams();
  const [objectStatus, setObjectStatus] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [allWorks, setAllWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    object_id: objectId,
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
    const fetchUserStatus = async () => {
      try {
        const accessToken = refresh(refreshToken);
        if (!accessToken || !registered) return;
        
        const response = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/auth/status/`,
          { headers: { "Authorization": `Bearer ${accessToken}` } }
        );
        setUserIsStaff(response.data.status !== "user");
      } catch (error) {
        console.error('Ошибка проверки статуса:', error);
      }
    };

    fetchUserStatus();
  }, [refreshToken, registered, setUserIsStaff]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authConfig = await getAuthHeader();
        
        // Загрузка данных объекта
        const statusResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/object/status/${objectId}/`,
          authConfig
        );
        setObjectStatus(statusResponse.data);
        setTitle(statusResponse.data.object.name);

        if (isStaff) {
          // Для прораба: история работ
          const worksResponse = await axios.get(
            `${process.env.REACT_APP_HOST}/api/v1/object/work-history/${objectId}/`,
            authConfig
          );
          setAllWorks(worksResponse.data.filter(work => work.review === null));
        } else {
          // Для работника: сначала проверяем свои задачи
          const userWorksResponse = await axios.get(
            `${process.env.REACT_APP_HOST}/api/v1/user/works/`,
            authConfig
          );

          userWorksResponse.data = userWorksResponse.data.filter((work) => {return work.end_time === null})
          
          if (userWorksResponse.data.length === 0) {
            // Если своих задач нет, запрашиваем доступные
            const freeWorksResponse = await axios.get(
              `${process.env.REACT_APP_HOST}/api/v1/object/work-free/${objectId}`,
              authConfig
            );
            setAvailableTasks(freeWorksResponse.data);
          } else {
            // Показываем задачи пользователя
            const active = userWorksResponse.data.find(work => 
              work.start_date && !work.end_date
            );
            setActiveTask(active || null);
            setAvailableTasks(userWorksResponse.data);
          }
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
  }, [objectId, refreshToken, setTitle, navigate, isStaff]);

  const handleCreateTask = async () => {
    try {
      const authConfig = await getAuthHeader();
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/start/`,
        newTaskData,
        authConfig
      );
      
      setAvailableTasks(prev => [...prev, response.data]);
      setShowCreateForm(false);
      setNewTaskData({
        object_id: objectId,
        name: '',
        description: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const handleInputChange = (e) => {
    setNewTaskData({
      ...newTaskData,
      [e.target.name]: e.target.value
    });
  };

  const handleCompleteTask = () => {
    setActiveTask(null);
    setAvailableTasks(prev => prev.filter(t => t.id !== activeTask?.id));
  };

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
          {allWorks.length > 0 ? (
            <>
              <center><h3>Работы на оценку</h3></center>
              <WorkList works={allWorks} isStaff={true} />
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
          {activeTask ? (
            <WorkImageForm 
              workId={activeTask.id}
              refreshToken={refreshToken}
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
                      <h4>Создать новую задачу</h4>
                      <div className="form-group">
                        <label className='form-label'>Название:</label>
                        <input
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
                          className='form-textarea'
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
                        className="create-btn"
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
    </div>
  );
};

export default ObjectDetails;