import React, { useState, useEffect } from 'react';
import CameraMy from "./CameraMy";
import ObjectDetails from "./Object";
import NavPanel from "./NavPanel";
import './App.css';

export default function MainPage({ isStaff, onLogOut }) {
  const [activeBlock, setActiveBlock] = useState('camera');
  const [currentObject, setCurrentObject] = useState(null);

  // Восстанавливаем объект только для вкладки камеры
  useEffect(() => {
    const savedObject = localStorage.getItem('currentObject');
    if (savedObject && activeBlock === 'camera') {
      setCurrentObject(savedObject);
    }
  }, [activeBlock]);

  const handleObjectClose = () => {
    localStorage.removeItem('currentObject');
    setCurrentObject(null);
  };

  const renderContent = () => {
    // Для вкладки камеры: показываем объект или камеру
    if (activeBlock === 'camera') {
      return currentObject ? (
        <ObjectDetails 
          isStaff={isStaff}
          objectId={currentObject}
          onClose={handleObjectClose}
        />
      ) : (
        <CameraMy onObjectDetected={setCurrentObject} />
      );
    }

    // Для остальных вкладок
    switch(activeBlock) {
      case 'history':
        return <div className="page-content">История работ</div>;
      case 'tasks':
        return <div className="page-content">Текущие задачи</div>;
      case 'profile':
        return (
          <div className="page-content">
            Профиль пользователя
            <button className="logout-button" onClick={onLogOut}>
              Выйти
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="header">
        <h3>YASMIN</h3>
      </header>

      <div className="content-wrapper">
        {renderContent()}
      </div>

      <NavPanel 
        activeBlock={activeBlock}
        onChangeBlock={setActiveBlock} // Разрешаем свободное переключение
      />
    </>
  );
}