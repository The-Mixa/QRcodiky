import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Account from './Account';

export default function MainPage({ registered, userIsStaff, onLogOut, setTitle }) {
  // Используем useEffect для установки заголовка
  useEffect(() => {
    setTitle("Главная");
  }, [setTitle]);

  return (
    <>
      {registered ? (
        <div className='centr-vert'>
          <NavLink to="/camera" className="link">
            Камера
          </NavLink>
          <br />
          <button onClick={onLogOut} className='link grey'>
            Выйти из аккаунта
          </button>
        </div>
      ) : (
        <Account
          registered={registered}
          userIsStaff={userIsStaff}
          onLogOut={onLogOut}
          setTitle={setTitle}
        />
      )}
    </>
  );
}