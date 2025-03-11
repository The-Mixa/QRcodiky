// WorkListReview.js
import React from 'react';
import './App.css';
import arrow from "./unwrap-green 1.svg";

const WorkListReview = ({ works, isStaff, onWorkSelect }) => {
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
              <div className="work-main-info">
                                <div style={{
                                  display: "flex", 
                                  flexDirection: "column", 
                                  justifyContent: "space-around"
                                }}>
                                  <div style={{
                                    minWidth: "20px",
                                    minHeight: "20px",
                                    maxHeight: "20px",
                                    marginRight: "20px",
                                    backgroundColor: "yellow",
                                    borderRadius: "10px"
                                  }}></div>
                                </div>
                                <div style={{width: "100%"}}>
                                  <h3 className="work-name">{work.name}</h3>
                                  <p className="object-name">
                                    {work.object?.name || 'Объект не указан'}
                                  </p>
                                </div>
                                <div className='arrow-container' style={{
                                  display: "flex", 
                                  flexDirection: "column", 
                                  justifyContent: "space-around"
                                }}>
                                  <img src={arrow} alt="Стрелка раскрытия"></img>
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

export default WorkListReview;