import React from 'react';
import './App.css';
import profile from "./profile-db 1.svg";
import history from "./history-db 1.svg";
import search from "./search-db 1.svg";
import tasks from "./tasks-db 1.svg";


export default function NavPanel({ activeBlock, onChangeBlock }) {
  const blocks = [
    { id: 'history', label: history},
    { id: 'camera', label: search},
    { id: 'tasks', label: tasks},
    { id: 'profile', label: profile}
  ];

  return (
    <nav className="bottom-nav">
      {blocks.map(block => (
        <button
          key={block.id}
          className={`nav-item ${activeBlock === block.id ? 'active' : ''}`}
          onClick={() => onChangeBlock(block.id)}
        >
          <img src={block.label}></img>
        </button>
      ))}
    </nav>
  );
}