import axios from 'axios';


export async function refresh(refresh_token) {
  try {
    const response = await axios.post(`${process.env.REACT_APP_HOST}/api/v1/auth/refresh/`, { "refresh_token": refresh_token });


    if (response.data.access_token !== undefined) {
      sessionStorage.setItem("access_token", response.data.access_token);
    } else {
      console.log("Invalid credentials");
    }
  } catch (error) {
    console.error('Ошибка при входе:', error);
  }
  const access_token = sessionStorage.getItem("access_token");

  if (access_token) {
    return access_token; 
  }

  return null; 
}



export function registered(){
  if (localStorage.getItem("refresh_token") !== "undefined" && localStorage.getItem("refresh_token") !== 'null' && localStorage.getItem("refresh_token") !== null)
    return true;
  return false;
}