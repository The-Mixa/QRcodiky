import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import jsQR from "jsqr";

export default function CameraMy({ onObjectDetected }) {
  const webcamRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraState, setCameraState] = useState('loading');

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Браузер не поддерживает API камеры');
        }

        // Проверяем разрешения через Permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const permissions = await navigator.permissions.query({ name: 'camera' });
          if (permissions.state === 'granted') {
            setHasCameraPermission(true);
            return;
          }
        }

        // Если Permissions API не поддерживается, делаем запрос напрямую
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setHasCameraPermission(true);
      } catch (err) {
        console.error('Camera access error:', err);
        setHasCameraPermission(false);
        setError(`Ошибка доступа к камере: ${err.message}`);
      }
    };

    checkPermissions();

    return () => {
      if (webcamRef.current?.stream) {
        webcamRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!hasCameraPermission || !isScanning) return;

    let animationFrameId;
    const scanFrame = () => {
      if (!webcamRef.current?.video || cameraState !== 'active') {
        animationFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      const video = webcamRef.current.video;
      if (video.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
        animationFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code?.data) {
          setIsScanning(false);
          const cleanedUrl = code.data.replace(/\/+$/, '');
          const objectId = cleanedUrl.split('/').pop();
          onObjectDetected(objectId);
        }
      } catch (e) {
        console.error('QR processing error:', e);
      }
      animationFrameId = requestAnimationFrame(scanFrame);
    };

    scanFrame();
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasCameraPermission, onObjectDetected, isScanning, cameraState]);

  if (hasCameraPermission === null) {
    return <div className="camera-loading">Проверка доступа к камере...</div>;
  }

  if (hasCameraPermission === false) {
    return (
      <div className="camera-permission-denied">
        <h2>Проблема с доступом к камере</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Повторить</button>
        <p>1. Проверьте настройки разрешений браузера</p>
        <p>2. Убедитесь что камера не используется другим приложением</p>
      </div>
    );
  }

  return (
    <div className="camera-container">
      <h2 style={{textAlign: "center"}}>QR сканер</h2>
      <br/>
      <center>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }}
          className="camera-view"
          onUserMedia={() => setCameraState('active')}
          onUserMediaError={(err) => {
            setCameraState('error');
            setError(`Камера не активирована: ${err.toString()}`);
          }}
        />
        {cameraState === 'error' && (
          <div className="camera-error">
            <p>Не удалось запустить камеру, хотя разрешение есть</p>
            <button onClick={() => window.location.reload()}>Перезагрузить</button>
          </div>
        )}
      </center>
    </div>
  );
}