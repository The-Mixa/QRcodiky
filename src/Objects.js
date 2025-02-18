import React, {useState} from 'react';
import axios from 'axios';
import {refresh} from "./refresh.js";

export default function Objects() {
    const [adress, setAdress] = useState('');

    const createObject = async () => {
        await axios.post('http://localhost:8000/objects/create', {"adress": adress})
    }
    return (
        <>
        <h1>
            Объекты
        </h1>
        <div className='form-container'>
            <form onSubmit={createObject}>
                <input type="text" name="adress" placeholder="Адресс объекта" onChange={setAdress} required />
                <button type="submit" >Добавить объект</button>
            </form>
        </div>
        </>
    );
};