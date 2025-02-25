import React from 'react';
import { Link } from 'react-router-dom';
import './App.css'; // Подключаем стили

const WorkListReview = ({ works, isStaff }) => {
  return (
    <div className="work-list-container">
      {works.length > 0 ? (
        <ul className="work-list">
          {works.map((work) => (
            <React.Fragment key={work.id}>
              
                <li className="work-item">
                  <Link to={`/work/${work.id}`} className="work-link">
                    <div className="work-content">
                      {work.images.length > 0 && (
                  <div className="images">
                    {work.images.map((image) => (
                      <img key={image.id} src={image.image} alt={`Work image ${image.id}`} />
                    ))}
                  </div>
                )}
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

export default WorkListReview;