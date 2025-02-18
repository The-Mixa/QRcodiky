import React from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { refresh } from './refresh';



export default function Account({registered, setRegistered, refreshToken, setRefreshToken}) {
    const logOut = async (e) => {
        if (refreshToken){
            await axios.post('http://localhost:8000/api/v1/auth/logout/', {"refresh_token": refreshToken})
            .then((response) => {
            if (response['error'] === undefined){
                setRefreshToken(null);
                setRegistered(false);
            }
            });
        }
        else {
            alert("you have already logouted");
        }

    };
    var userstatus = "";

    axios.get('http://localhost:8000/api/v1/auth/status/', {"headers": {
        "authorization": `Bearer ${refresh(refreshToken)}`
    }})
        .then((response) => {
        userstatus = response['status'];
    });
    

    return (
        <div style={{margin: 40 + 'px'}}>
        <h1>Аккаунт</h1>
        <h1>{userstatus}</h1>
        {!registered  && 
            <>
                <NavLink to="/login">
                    Войти в аккаунт
                </NavLink>
                <br></br>
                <NavLink to="/signup">
                    Зарегестрироваться
                </NavLink>
            </>
        }
        {registered &&
            <button onClick={logOut}>Выйти из аккаунта</button>
        }
        <br></br>
        <br></br>
        <NavLink to="/">
            На главную
        </NavLink>

        
        </div>
    );
};