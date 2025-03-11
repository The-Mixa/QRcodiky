import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from "jsqr";

export default function CameraMy({ onObjectDetected }) {
  const webcamRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) return;

      const img = new Image();
      img.src = imageSrc;
      img.onload = function() {
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
  }, [onObjectDetected]);

  return (
    <div className="camera-container">

      <h2 style={{textAlign: "center"}}>QR сканер</h2>
      <br></br>

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