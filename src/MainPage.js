import React, { useState, useEffect } from 'react';
import CameraMy from "./CameraMy";
import ObjectDetails from "./Object";
import NavPanel from "./NavPanel";
import './App.css';
import TodoPage from './TodoPage';
import Account from './Account';
import HistoryPage from './HistoryPage';
import logo from "./yasmin 1.svg"

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
        return <div className='page-content'><HistoryPage/></div>
      case 'tasks':
        return <div className="page-content">
        <TodoPage isStaff={isStaff}/>
      </div>;
      case "profile":
        return (
          <div className="page-content">
            <Account onLogOut={onLogOut}/>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="header" onClick={() => setActiveBlock("camera")}>
        <img src={logo}></img>
        <h3>Yasmin</h3>
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