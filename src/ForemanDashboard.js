import React, { useState } from 'react';
import WorkHistory from './WorkHistory';
import ReviewList from './ReviewList';

const ForemanDashboard = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  // Заглушка для данных
  const objects = [
    { id: 1, address: 'ул. Ленина, 10' },
    { id: 2, address: 'пр. Мира, 25' }
  ];

  return (
    <div className="foreman-dashboard">
      <h1>Панель прораба</h1>
      
      <div className="dashboard-actions">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={showHistory ? 'active' : ''}
        >
          {showHistory ? 'Скрыть историю' : 'Показать историю'}
        </button>
      </div>

      {showHistory && (
        <div className="history-section">
          <div className="object-selector">
            <label>Выберите объект:</label>
            <select
              value={selectedObjectId || ''}
              onChange={(e) => setSelectedObjectId(e.target.value)}
            >
              <option value="">-- Выберите объект --</option>
              {objects.map(obj => (
                <option key={obj.id} value={obj.id}>
                  {obj.address}
                </option>
              ))}
            </select>
          </div>

          {selectedObjectId && (
            <>
              <WorkHistory objectId={selectedObjectId} />
              <ReviewList objectId={selectedObjectId} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ForemanDashboard;