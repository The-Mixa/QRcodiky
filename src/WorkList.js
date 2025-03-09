// WorkList.js
import React from 'react';
import './App.css';

const WorkList = ({ works, isStaff, onWorkSelect }) => {
  return (
    <div className="work-list-container">
      {works.length > 0 ? (
        <ul className="work-list">
          {works.map((work) => (
            <li 
              key={work.id} 
              className="work-item"
              onClick={() => onWorkSelect(work.id)}
            >
              <div className="work-content">
                <h3 className="work-name">{work.name}</h3>
                <p className="work-description">{work.description}</p>
              </div>
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