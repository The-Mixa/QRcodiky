import React from 'react';
import { NavLink } from 'react-router-dom';

export default function MainPage() {
    return (
    <div style={{margin: 40 + 'px'}}>
        <h1>Главная страница</h1>
        <NavLink to="/account">
            Аккаунт
        </NavLink>
        <br></br>
        <NavLink to="/camera">
            Камера
        </NavLink>
    </div>
);
}