import React from 'react';
import './App.css';

export default function NavPanel({ activeBlock, onChangeBlock }) {
  const blocks = [
    { id: 'camera', label: 'Камера', icon: '📷' },
    { id: 'history', label: 'История', icon: '📅' },
    { id: 'tasks', label: 'Задачи', icon: '✅' },
    { id: 'profile', label: 'Профиль', icon: '👤' }
  ];

  return (
    <nav className="bottom-nav">
      {blocks.map(block => (
        <button
          key={block.id}
          className={`nav-item ${activeBlock === block.id ? 'active' : ''}`}
          onClick={() => onChangeBlock(block.id)}
        >
          <span className="nav-icon">{block.icon}</span>
          <span className="nav-label">{block.label}</span>
        </button>
      ))}
    </nav>
  );
}