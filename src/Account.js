import React from 'react';
import { NavLink } from 'react-router-dom';
import './App.css'; // Не забудьте подключить CSS файл
import { registered } from './refresh';

export default function Account({ onLogOut, userIsStaff, setTitle }) {
    setTitle("Аккаунт");
    const reg = registered();

    return (
        <div className='centr-vert'>

            {reg && userIsStaff &&
                <h1 className="admin">Вы администратор</h1>
            }
            {reg && !userIsStaff &&
                <h1 className="user">Вы пользователь</h1>
            }
            {!reg &&
                <>
                    <NavLink className="link" to="/login">
                        Войти в аккаунт
                    </NavLink>
                    <br />
                    <NavLink className="link" to="/signup">
                        Зарегистрироваться
                    </NavLink>
                </>
            }
            {reg &&
                <button className="button" onClick={onLogOut}>Выйти из аккаунта</button>
            }
        </div>
    );
}
