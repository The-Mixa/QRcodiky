import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from "jsqr";

export default function CameraMy({ onObjectDetected }) {
  const webcamRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true); // Новое состояние для контроля сканирования

  // Проверка доступа к камере
  useEffect(() => {
    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Важно освобождать предыдущие потоки
        if (webcamRef.current?.stream) {
          webcamRef.current.stream.getTracks().forEach(track => track.stop());
        }
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
    if (!hasCameraPermission || !isScanning) return;

    let animationFrameId;
    const scanFrame = () => {
      if (!webcamRef.current?.video) {
        animationFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      const video = webcamRef.current.video;
      // Проверка готовности видео
      if (video.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
        animationFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      const canvas = document.createElement('canvas');
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
          // Останавливаем сканирование после успеха
          setIsScanning(false);
          const cleanedUrl = code.data.replace(/\/+$/, '');
          const objectId = cleanedUrl.split('/').pop();
          onObjectDetected(objectId);
        }
      } catch (e) {
        console.error('Ошибка обработки QR-кода:', e);
      }
      animationFrameId = requestAnimationFrame(scanFrame);
    };

    scanFrame();
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasCameraPermission, onObjectDetected, isScanning]); // Добавлена зависимость от isScanning

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