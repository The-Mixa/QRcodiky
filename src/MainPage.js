import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Account from './Account';
import { Navigate } from 'react-router-dom';

export default function MainPage({ registered, userIsStaff, onLogOut, setTitle }) {
  useEffect(() => {
    setTitle("Главная");
  }, [setTitle]);

  if (!registered) {
    return <Navigate to="/login" />;
  }

  return (
    <div className='centr-vert'>
      <NavLink to="/camera" className="link">
        Камера
      </NavLink>
      <br />
      <button onClick={onLogOut} className='link grey'>
        Выйти из аккаунта
      </button>
    </div>
  );
}
