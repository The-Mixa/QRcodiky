import React from 'react';

const AvailableTasks = ({ tasks, onStartTask }) => {
  return (
    <div className="available-tasks">
      <h2>Доступные задачи</h2>
      {tasks.length > 0 ? (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className="task-item">
              <div className="task-info">
                <h3>{task.name}</h3>
                <p>{task.description}</p>
              </div>
              <button 
                onClick={() => onStartTask(task.id)}
                className="start-task-btn"
              >
                Начать задачу
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет доступных задач</p>
      )}
    </div>
  );
};

export default AvailableTasks;