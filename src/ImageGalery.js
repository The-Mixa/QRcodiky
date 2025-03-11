import React, { useState } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ src }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        className="thumbnail"
        src={process.env.REACT_APP_HOST + src}
        alt="Миниатюра"
        onClick={() => setIsOpen(true)}
      />
      
      {isOpen && (
        <div className="fullscreen-overlay" onClick={() => setIsOpen(false)}>
          <div className="fullscreen-content">
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
            <img 
                src={process.env.REACT_APP_HOST + src}
                alt="Полноэкранный просмотр" 
                className="fullscreen-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;