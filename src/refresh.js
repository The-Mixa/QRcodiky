import axios from 'axios';


export function refresh(refresh_token){
    try {
        axios.post('http://localhost:8000/api/v1/auth/refresh/', {"refresh_token": refresh_token})
        .then(function(response) {
          if (response["error"] === undefined){
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