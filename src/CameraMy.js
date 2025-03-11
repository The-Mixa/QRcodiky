import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import jsQR from "jsqr";
import './CameraMy.css'; // Подключаем стили

export default function CameraMy({ onObjectDetected }) {
  const webcamRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [error, setError] = useState(null);

  // Функция для запроса доступа к камере
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Если доступ получен, освобождаем поток
      stream.getTracks().forEach(track => track.stop());
      setHasCameraPermission(true);
      setError(null);
    } catch (err) {
      setHasCameraPermission(false);
      setError('Доступ к камере запрещен. Пожалуйста, разрешите доступ в настройках браузера.');
    }
  };

  // Проверка разрешений при монтировании компонента
  useEffect(() => {
    requestCameraAccess();
  }, []);

  // Логика сканирования QR-кода
  useEffect(() => {
    if (!hasCameraPermission) return;

    const interval = setInterval(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) return;

      const img = new Image();
      img.src = imageSrc;
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && onObjectDetected) {
          const objectId = code.data.split('/').pop();
          onObjectDetected(objectId);
        }
      };
    }, 100);

    return () => clearInterval(interval);
  }, [hasCameraPermission, onObjectDetected]);

  // Если доступ к камере запрещен
  if (hasCameraPermission === false) {
    return (
      <div className="camera-permission-denied">
        <h2>Доступ к камере запрещен</h2>
        <p>{error}</p>
        <button onClick={requestCameraAccess}>Повторить запрос</button>
        <p>
          Если проблема persists, пожалуйста, разрешите доступ к камере в настройках браузера.
        </p>
      </div>
    );
  }

  // Если доступ к камере еще не определен
  if (hasCameraPermission === null) {
    return (
      <div className="camera-loading">
        <h2>Запрос доступа к камере...</h2>
      </div>
    );
  }

  // Основной интерфейс камеры
  return (
    <div className="camera-container">
      <h2 style={{ textAlign: "center" }}>QR сканер</h2>
      <br />
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