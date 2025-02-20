import React from 'react';
import { NavLink } from 'react-router-dom';
import Account from './Account'; // Импортируем компонент Account

export default function MainPage({ registered, userIsStaff, onLogOut, setTitle }) {

    setTitle("Главная");
  return (
    <>
        
      {registered ? (
        <div className='centr-vert'>
        <NavLink to="/camera" className="link">
          Камера
        </NavLink>

        <br />
        <button onClick={onLogOut} className='link grey'>Выйти из аккаунта</button>
        </div>
      ) : (
        // Если пользователь не залогинен, показываем компонент Account
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