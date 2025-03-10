// WorkListReview.js
import React from 'react';
import './App.css';

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
              <div className="work-content">
              <div style={{minWidth: "20px", minHeight: "20px", backgroundColor: "yellow", borderRadius: "10px", maxWidth: "20px", maxHeight: "20px", marginRight: "20px"}}></div>
                <div>
                {work.images.length > 0 && (
                  <div className="images">
                    {work.images.map((image) => (
                      <img key={image.id} src={image.image} alt={`Work image ${image.id}`} />
                    ))}
                  </div>
                )}
                <h2 className="work-name">{work.name}</h2>
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

export default WorkListReview;