import axios from 'axios';


export function refresh(){
    var refresh_token = localStorage.getItem("refresh_token");
    try {
        axios.post('http://localhost:5000/refresh', {"refresh_token": refresh_token})
        .then(function(response) {
          if (response["error"] == "NoneError"){
            var access_token = response["access_token"];
            return access_token;           
          }
          console.log("Invalid credentials");
  
        });
        
      } catch (error) {
        console.error('Ошибка при входе:', error);
      }

      return null;
}