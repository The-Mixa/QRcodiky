import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from "jsqr";
import { NavLink, useNavigate } from 'react-router-dom';

export default function CameraComponent({ setTitle }) {
    const navigate = useNavigate();
    const [qrfind, setQrFind] = useState(false);
    const [codeData, setCodeData] = useState("");
    const webcamRef = useRef(null);
    
    const videoConstraints = {
        facingMode: "environment",
        width: 500,
        height: 500 
    };

    useEffect(() => {
        setTitle("Камера");

        // Функция для сканирования QR-кодов в реальном времени
        const interval = setInterval(() => {
            capture();
        }, 100); // Захватывать каждый 100 мс (или по вашему усмотрению)

        return () => clearInterval(interval); // Очистить интервал, когда компонент будет размонтирован
    }, []);

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        const img = new Image();
        img.src = imageSrc;

        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                setCodeData(code.data);
                setQrFind(true);

                // Переход по ссылке из QR-кода
                window.location.href = code.data;
            } else {
                setQrFind(false);
            }
        };
    };

    return (
        <div>
            <NavLink to="/" className="link">&lt;</NavLink>
            <br/> 
            <div className="camera-container">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    style={{
                        width: '100%',
                        borderRadius: "15px"
                    }}
                />
            </div>

            {qrfind && (
                <div>
                    <h1>QR-code найден</h1>
                    <p>Перехожу по ссылке...</p>
                </div>
            )}

            {!qrfind && (
                <div>
                    <h1>QR-code не найден</h1>
                </div>
            )}
        </div>
    );
};
