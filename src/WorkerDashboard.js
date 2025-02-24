import React, { useState } from 'react';
import TaskForm from './TaskForm';
import AvailableTasks from './AvailableTasks';

const WorkerDashboard = () => {
  // Состояния для примера
  const [hasTasks, setHasTasks] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([
    { id: 1, name: 'Задача 1', description: 'Описание задачи 1' },
    { id: 2, name: 'Задача 2', description: 'Описание задачи 2' }
  ]);

  const handleStartTask = (taskId) => {
    const task = availableTasks.find(t => t.id === taskId);
    setActiveTask(task);
    setAvailableTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleCompleteTask = () => {
    setActiveTask(null);
    setHasTasks(availableTasks.length > 0);
  };

  const handleCreateTask = () => {
    const newTask = {
      id: Date.now(),
      name: `Новая задача ${availableTasks.length + 1}`,
      description: 'Описание новой задачи'
    };
    setActiveTask(newTask);
    setHasTasks(true);
  };

  return (
    <div className="worker-dashboard">
      <h1>Панель работника</h1>

      {!hasTasks ? (
        <div className="no-tasks">
          <p>Нет доступных задач</p>
          <button onClick={handleCreateTask}>Создать новую задачу</button>
        </div>
      ) : activeTask ? (
        <TaskForm 
          task={activeTask} 
          onComplete={handleCompleteTask}
        />
      ) : (
        <AvailableTasks 
          tasks={availableTasks}
          onStartTask={handleStartTask}
        />
      )}
    </div>
  );
};

export default WorkerDashboard;