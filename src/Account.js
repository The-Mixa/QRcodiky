import React from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';


export default function Account({registered, setRegistered, refreshToken, setRefreshToken, userData, setUserData}) {
    const logOut = async (e) => {
        if (refreshToken){
            await axios.post('http://localhost:8000/api/v1/auth/logout/', {"refresh_token": refreshToken})
            .then((response) => {
            if (response['error'] === undefined){
                setRefreshToken(null);
                setRegistered(false);
                setUserData({status: 'unauth'});
                localStorage.setItem(refreshToken, null);
            }
            });
        }
        else {
            alert("you have already logouted");
        }

    };
    
    return (
        <div style={{margin: 40 + 'px'}}>
        <h1>Аккаунт</h1>
        <h1>{userData.status}</h1>
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