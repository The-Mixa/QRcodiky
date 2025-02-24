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

  const getAuthHeader = async () => {
    try {
      const accessToken = refresh(refreshToken);
      return { headers: { Authorization: `Bearer ${accessToken}` } };
    } catch (error) {
      throw new Error('Ошибка авторизации');
    }
  };

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
          setAllWorks(worksResponse.data || []);
        } else {
          // Для работника: задачи
          await axios.get(
            `${process.env.REACT_APP_HOST}/api/v1/user/works/`,
            authConfig
          ).then((tasksResponse) =>{
            setActiveTask(tasksResponse.data?.active_task || null);
            setAvailableTasks(tasksResponse.data?.available_tasks || []);}
          ).catch((error) => {console.log("no works")});
          
        }
      } catch (error) {
        console.log(error);
        const status = error.response?.status || 500;
        setError(status);
        setTitle("Ошибка");
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [objectId, refreshToken, setTitle, navigate]);

  const createNewTask = async () => {
    try {
      const authConfig = await getAuthHeader();
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/user/works/`,
        { object_id: objectId },
        authConfig
      );
      setActiveTask(response.data);
      setAvailableTasks(prev => [...prev, response.data]);
    } catch (error) {
      setError(error.response?.status || 500);
    }
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
        <NavLink to="/" className="link">На главную</NavLink>
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
              <h3>Работы на оценку</h3>
              <WorkList works={allWorks} isStaff={true} />
            </>
          ) : (
            <div className="empty-state">
              <p>Нет работ на оценку</p>
              <p>История работ по этому объекту пуста</p>
            </div>
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
                  <h3>Доступные задачи</h3>
                  <WorkList works={availableTasks} isStaff={false} />
                </>
              ) : (
                <div className="no-tasks">
                  <p>Нет доступных задач</p>
                  <button 
                    onClick={createNewTask}
                    className="create-task-btn"
                  >
                    Создать новую задачу
                  </button>
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