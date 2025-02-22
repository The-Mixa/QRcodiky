import React from 'react';
import { NavLink } from 'react-router-dom';
import './App.css'; // Не забудьте подключить CSS файл

export default function Account({ onLogOut, registered, userIsStaff, setTitle }) {
    setTitle("Аккаунт");

    return (
        <div className='centr-vert'>

            {registered && userIsStaff &&
                <h1 className="admin">Вы администратор</h1>
            }
            {registered && !userIsStaff &&
                <h1 className="user">Вы пользователь</h1>
            }
            {!registered &&
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
            {registered &&
                <button className="button" onClick={onLogOut}>Выйти из аккаунта</button>
            }
        </div>
    );
}
