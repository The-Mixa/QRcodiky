import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WorkList from './WorkList';
import WorkListReview from './WorkListReview';
import WorkImageForm from './WorkImageForm';
import WorkDetails from './WorkDetails';
import { refresh } from './refresh';
import "./App.css";
import backArrow from "./back-arrow.svg";

export default function ObjectDetails({ isStaff, objectId, onClose }) {
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

  const getAuthHeader = async () => {
    try {
      const accessToken = await refresh(localStorage.getItem("refresh_token"));
      return { headers: { Authorization: `Bearer ${accessToken}` } };
    } catch (error) {
      throw new Error('Ошибка авторизации');
    }
  };

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  const fetchData = async () => {
    try {
      const authConfig = await getAuthHeader();
      
      const statusResponse = await axios.get(
        `${process.env.REACT_APP_HOST}/api/v1/object/status/${objectId}/`,
        authConfig
      );
      setObjectStatus(statusResponse.data);

      const historyResponse = await axios.get(
        `${process.env.REACT_APP_HOST}/api/v1/object/work-history/${objectId}/`,
        authConfig
      );
      setWorkHistory(historyResponse.data);

      const tasksResponse = await axios.get(
        `${process.env.REACT_APP_HOST}/api/v1/object/work-history/${objectId}/`,
        authConfig
      );
      
      const current = tasksResponse.data.filter(work => work.start_time && !work.end_time);
      setCurrentTasks(current);

      const available = tasksResponse.data.filter(work => !work.start_time && !work.end_time);
      setAvailableTasks(available);

      if (isStaff) {
        const worksResponse = await axios.get(
          `${process.env.REACT_APP_HOST}/api/v1/object/works_without_reviews/${objectId}/`,
          authConfig
        );
        setWorksWithoutReviews(worksResponse.data);
      }

    } catch (error) {
      console.error(error);
      setError(error.response?.status || 500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [objectId, isStaff, fetchTrigger]);

  const handleCompleteTask = () => {
    setFetchTrigger(prev => prev + 1);
  };

  const handleCreateTask = async () => {
    try {
      const authConfig = await getAuthHeader();
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/v1/start/`,
        {
          object: objectId,
          name: newTaskData.name,
          description: newTaskData.description,
        },
        authConfig
      );
      setAvailableTasks(prev => [...prev, response.data]);
      setShowCreateForm(false);
      setNewTaskData({
        object_id: objectId,
        name: '',
        description: ''
      });
      setFetchTrigger(prev => prev + 1);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

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
        <div className="object-info" style={currentTasks?.length > 0 ? {borderRadius: "20px"} : {gap: "10px"}}>
          <h2>{objectStatus?.object?.name || "Noname"}</h2>
          <div style={{padding: "20px", paddingTop: "0px"}}>
            <p><b>Адрес:</b> {objectStatus?.object?.address || "Noinfo"}</p>
            <p><b>Статус:</b> {objectStatus.status}</p>
          </div>
        </div>
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
              {currentTasks.length > 0 ? (
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