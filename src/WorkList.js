// WorkList.js
import React from 'react';
import './App.css';

const WorkList = ({ works, isStaff, onWorkSelect, color }) => {
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
                <div style={{minWidth: "20px", minHeight: "20px", backgroundColor: color, borderRadius: "10px", maxWidth: "20px", maxHeight: "20px", marginRight: "20px"}}></div>

                <div>
                  <h3 className="work-name">{work.name}</h3>
                  <p className="work-description">{work.description}</p>
                </div>
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