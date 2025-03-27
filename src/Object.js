import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import WorkList from './WorkList';
import WorkListReview from './WorkListReview';
import WorkImageForm from './WorkImageForm';
import WorkDetails from './WorkDetails';
import { refresh } from './refresh';
import "./App.css";
import backArrow from "./back-arrow.svg";

export default function ObjectDetails({ isStaff, objectId, onClose }) {
  // Состояния компонента
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [objectStatus, setObjectStatus] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [currentTasks, setCurrentTasks] = useState([]);
  const [worksWithoutReviews, setWorksWithoutReviews] = useState([]);
  const [workHistory, setWorkHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    object_id: objectId,
    name: '',
    description: ''
  });
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Рефы для управления жизненным циклом
  const isMounted = useRef(true);
  const abortControllerRef = useRef(new AbortController());

  // Эффект для управления классом body
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Эффект очистки при размонтировании
  useEffect(() => {
    return () => {
      isMounted.current = false;
      abortControllerRef.current.abort();
    };
  }, []);

  // Функция получения заголовков авторизации
  const getAuthHeader = async () => {
    try {
      const accessToken = await refresh(localStorage.getItem("refresh_token"));
      return { 
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: abortControllerRef.current.signal
      };
    } catch (error) {
      if (isMounted.current) setError(403);
    }
  };

  // Основная функция загрузки данных
  const fetchData = useCallback(async () => {
    try {
      // Создаём новый контроллер для каждого запроса
      const controller = new AbortController();
      const authConfig = await getAuthHeader(controller.signal);
  
      // Проверка актуальности компонента
      if (!isMounted.current) return;
  
      setLoading(true);
      setError(null);
  
      // Параллельные запросы с одним контроллером
      const [statusResponse, historyResponse, tasksResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_HOST}/api/v1/object/status/${objectId}/`, authConfig),
        axios.get(`${process.env.REACT_APP_HOST}/api/v1/object/work-history/${objectId}/`, authConfig),
        axios.get(`${process.env.REACT_APP_HOST}/api/v1/object/work-free/${objectId}/`, authConfig),
        ...(isStaff ? [
          axios.get(`${process.env.REACT_APP_HOST}/api/v1/object/works_without_reviews/${objectId}/`, authConfig)
        ] : [])
      ]);
  
      // Обработка данных только если компонент смонтирован
      if (isMounted.current) {
        setObjectStatus(statusResponse.data);
        setWorkHistory(historyResponse.data);
        
        const currentTasks = tasksResponse.data.filter(w => w.start_time && !w.end_time);
        const availableTasks = tasksResponse.data.filter(w => !w.start_time && !w.end_time);
        
        setCurrentTasks(currentTasks);
        setAvailableTasks(availableTasks);
  
        if (isStaff && tasksResponse.length > 3) {
          setWorksWithoutReviews(tasksResponse[3].data);
        }
      }
  
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Fetch canceled:', error.message);
      } else if (isMounted.current) {
        console.error('Fetch error:', error);
        setError(error.response?.status || 500);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [objectId, isStaff]); // Правильные зависимости

  // Эффект для вызова загрузки данных
  useEffect(() => {
    const controller = new AbortController();
    isMounted.current = true;
  
    const init = async () => {
      await fetchData();
    };
  
    init();
  
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [fetchData]); 

  // Обработчики событий
  const handleCompleteTask = () => {
    setFetchTrigger(prev => prev + 1);
  };

  const handleWorkStart = () => {
    setFetchTrigger(prev => prev + 1);
  };

  const handleCreateTask = useCallback(async () => {
    const controller = new AbortController();
    
    try {
      const authConfig = await getAuthHeader(controller.signal);
      
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/start/`,
        {
          object: objectId,
          name: newTaskData.name,
          description: newTaskData.description,
        },
        authConfig
      );
  
      if (isMounted.current) {
        setAvailableTasks(prev => [...prev, response.data]);
        setShowCreateForm(false);
        setNewTaskData({ object_id: objectId, name: '', description: '' });
        setFetchTrigger(prev => prev + 1);
      }
  
    } catch (error) {
      if (!axios.isCancel(error) && isMounted.current) {
        setError(error.response?.data?.message || error.message);
      }
    }
  }, [objectId, newTaskData.name, newTaskData.description]);

  if (loading) return <div className="loading">Загрузка данных...</div>;

  if (error || objectStatus?.status === "busy") {
    return (
      <div className="error-container">
        {error === 404 && <p>Объект не найден</p>}
        {error === 403 && <p>Доступ запрещен</p>}
        {(error === 400 || objectStatus?.status === "busy") && <p>Вы работаете на другом объекте</p>}
        <button className="link" onClick={onClose}>Назад к камере</button>
      </div>
    );
  }

  return (
    <div className="object-container">
      <button className="close-button" onClick={onClose}>
        <img src={backArrow} alt="Назад"></img>
      </button>
      
      {objectStatus && (
        <>
        <button onClick={onClose} style={{position: "absolute", top: "10px", left: "10px", backgroundColor: "rgba(0, 0, 0, 0)", border: "0px"}}>
          <img src={backArrow}></img>
        </button>
        <div className="object-info" style={currentTasks?.length > 0 ? {borderRadius: "20px"} : {gap: "10px"}}>
          <h2>{objectStatus?.object?.name || "Noname"}</h2>
          <div style={{padding: "20px", paddingTop: "0px"}}>
            <p><b>Адрес:</b> {objectStatus?.object?.address || "Noinfo"}</p>
            <p><b>Статус:</b> {objectStatus.status}</p>
          </div>
        </div>
        </>
      )}

      {selectedWorkId ? (
        <WorkDetails 
          workId={selectedWorkId}
          isStaff={isStaff}
          onBack={() => {
            setSelectedWorkId(null);
            setFetchTrigger(prev => prev + 1);
          }}
          setTitle={() => {}}
        />
      ) : (
        <>
          {isStaff ? (
            <div className="foreman-interface">
              {/* Секция создания задачи */}
              {availableTasks.length === 0 && (
                <div className="create-task-section">
                  {showCreateForm ? (
                    <form className="work-form">
                      <input
                        type="text"
                        name="name"
                        placeholder="Название задачи"
                        value={newTaskData.name}
                        onChange={(e) => setNewTaskData({...newTaskData, name: e.target.value})}
                      />
                      <textarea
                        name="description"
                        placeholder="Описание задачи"
                        value={newTaskData.description}
                        onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                      />
                      <div className="form-actions">
                        <button type="button" onClick={handleCreateTask}>
                          Создать
                        </button>
                        <button type="button" onClick={() => setShowCreateForm(false)}>
                          Отмена
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      className="link create-task-button"
                      onClick={() => setShowCreateForm(true)}
                    >
                      Создать новую задачу
                    </button>
                  )}
                </div>
              )}

              {/* Список работ на оценку */}
              {worksWithoutReviews.length > 0 && (
                <>
                  <h3>Работы на оценку</h3>
                  <WorkListReview
                    works={worksWithoutReviews}
                    onWorkSelect={setSelectedWorkId}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="worker-interface">
              {currentTasks?.length > 0 ? (
                <WorkImageForm 
                  workId={currentTasks[0].id}
                  onComplete={handleCompleteTask}
                />
              ) : (
                <div className="tasks-section">
                  {availableTasks.length > 0 ? (
                    <>
                      <h3>Доступные задачи</h3>
                      <WorkList 
                        works={availableTasks}
                        onWorkSelect={setSelectedWorkId}
                        onWorkStart={handleWorkStart} // Добавляем коллбэк
                        color={"red"}
                      />
                    </>
                  ) : (
                    <div className="no-tasks">
                      <p>Нет доступных задач</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

