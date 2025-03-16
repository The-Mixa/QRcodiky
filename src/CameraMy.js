import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import jsQR from "jsqr";

export default function CameraMy({ onObjectDetected }) {
  const webcamRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [error, setError] = useState(null);

  // Проверка доступа к камере
  useEffect(() => {
    const checkCameraAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
      } catch (err) {
        setHasCameraPermission(false);
        setError('Доступ к камере запрещен. Пожалуйста, разрешите доступ в настройках браузера.');
      }
    };
    
    checkCameraAccess();
  }, []);

  // Логика сканирования QR-кода
  useEffect(() => {
    if (!hasCameraPermission) return;

    const interval = setInterval(() => {
      if (!webcamRef.current?.video?.readyState) return;

      const canvas = document.createElement('canvas');
      const video = webcamRef.current.video;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code?.data && onObjectDetected) {
          // Обрабатываем URL с завершающим слешем
          const cleanedUrl = code.data.replace(/\/+$/, ''); // Удаляем все слеши в конце
          const parts = cleanedUrl.split('/');
          const objectId = parts[parts.length - 1]; // Берем последнюю часть после последнего слеша
          
          if (objectId) {
            onObjectDetected(objectId);
          }
        }
      } catch (e) {
        console.error('Ошибка обработки QR-кода:', e);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [hasCameraPermission, onObjectDetected]);

  // Состояния загрузки
  if (hasCameraPermission === null) {
    return (
      <div className="camera-loading">
        <h2>Запрос доступа к камере...</h2>
      </div>
    );
  }

  // Ошибка доступа
  if (hasCameraPermission === false) {
    return (
      <div className="camera-permission-denied">
        <h2>Доступ к камере запрещен</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Повторить запрос</button>
        <p>Пожалуйста, разрешите доступ к камере в настройках браузера.</p>
      </div>
    );
  }

  // Основной интерфейс
  return (
    <div className="camera-container">
      <h2 style={{textAlign: "center"}}>QR сканер</h2>
      <br/>
      <center>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          className="camera-view"
        />
      </center>
    </div>
  );
}