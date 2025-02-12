import React from 'react';
import { NavLink } from 'react-router-dom';


export default function Account() {
    return (
        <div style={{margin: 40 + 'px'}}>
        <h1>Аккаунт</h1>
        <NavLink to="/login">
            Войти в аккаунт
        </NavLink>
        <br></br>
        <NavLink to="/signup">
            Зарегестрироваться
        </NavLink>
        <br></br>
        <br></br>
        <NavLink to="/">
            На главную
        </NavLink>
        </div>
    );
};