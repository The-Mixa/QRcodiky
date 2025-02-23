import axios from 'axios';


export function refresh(refresh_token){
  axios.post(`http://${process.env.HOST}:8000/api/v1/auth/refresh/`, {"refresh_token": refresh_token})
  .then((response) => {
    if (response['data']["access_token"] !== undefined){
      sessionStorage.setItem("access_token", response['data']["access_token"]);
    }
    else{
    console.log("Invalid credentials");
    }
  })
  
  .catch( (error) => {
  console.error('Ошибка при входе:', error);
  });
  const access_token = sessionStorage.getItem("access_token");
  if (access_token){
    localStorage.removeItem("access_token");
    return access_token;
  }
}
