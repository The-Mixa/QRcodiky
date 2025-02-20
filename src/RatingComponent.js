import React from 'react';
import './App.css';


const RatingComponent = ({ rating, setRating }) => {
  return (
    <div className="rating-container">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? 'active' : ''}`}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingComponent;