import axios from 'axios';

const TOKEN_LIFETIME = 29 * 60 * 1000; // 29 минут в миллисекундах

export async function refresh(refresh_token) {
  // Проверяем существующий токен
  const storedAccess = {
    token: sessionStorage.getItem("access_token"),
    timestamp: parseInt(sessionStorage.getItem("access_token_ts") || "0", 10)
  };

  // Если токен валиден и не истек - возвращаем его
  if (storedAccess.token && Date.now() - storedAccess.timestamp < TOKEN_LIFETIME) {
    return storedAccess.token;
  }

  try {
    // Пытаемся обновить токен
    const response = await axios.post(
      `${process.env.REACT_APP_HOST}/api/v1/auth/refresh/`, 
      { "refresh_token": refresh_token }
    );

    if (response.data.access_token) {
      // Сохраняем новый токен с меткой времени
      sessionStorage.setItem("access_token", response.data.access_token);
      sessionStorage.setItem("access_token_ts", Date.now().toString());
      return response.data.access_token;
    }
    
    // Если нет нового токена, но есть старый (в пределах полного срока)
    if (storedAccess.token && Date.now() - storedAccess.timestamp < 2 * TOKEN_LIFETIME) {
      return storedAccess.token;
    }
    
    return null;
    
  } catch (error) {
    console.error('Refresh failed:', error);
    
    // Fallback на старый токен если он еще жив
    if (storedAccess.token && Date.now() - storedAccess.timestamp < 2 * TOKEN_LIFETIME) {
      return storedAccess.token;
    }
    
    // Полная очистка при критической ошибке
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token_ts");
    localStorage.removeItem("refresh_token");
    return null;
  }
}

export function registered() {
  const refreshToken = localStorage.getItem("refresh_token");
  return !!refreshToken && refreshToken !== "undefined" && refreshToken !== "null";
}


export function registered(){
  if (localStorage.getItem("refresh_token") !== "undefined" && localStorage.getItem("refresh_token") !== 'null' && localStorage.getItem("refresh_token") !== null)
    return true;
  return false;
}