import React from 'react';
import { Link } from 'react-router-dom';
import './App.css'; // Подключаем стили

const WorkList = ({ works, isStaff }) => {
  return (
    <div className="work-list-container">
      <h2 className="work-list-title">{isStaff ? 'Работы на оценку' : 'Мои работы'}</h2>
      {works.length > 0 ? (
        <ul className="work-list">
          {works.map((work) => (
            <React.Fragment key={work.id}>
              
                <li className="work-item">
                  <Link to={`/work/${work.id}`} className="work-link">
                    <div className="work-content">
                      <h3 className="work-name">{work.name}</h3>
                      <p className="work-description">{work.description}</p>
                    </div>
                  </Link>
                </li>
              
            </React.Fragment>
          ))}
        </ul>
      ) : (
        <p className="work-list-empty">Работы отсутствуют</p>
      )}
    </div>
  );
};

export default WorkList;