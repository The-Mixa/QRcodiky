import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera } from 'react-camera-pro';
import jsQR from "jsqr";

export default function CameraComponent({ setTitle }) {
    const [img, setImg] = useState(null);
    const [qrfind, setQrFind] = useState(false);
    const [codeData, setCodeData] = useState("");
    const cameraRef = useRef(null);
    
    useEffect(() => {
        setTitle("Сканирование QR");
    }, [setTitle]);

    const capture = useCallback(() => {
        const imageSrc = cameraRef.current?.takePhoto();
        if (!imageSrc) return;
        
        setImg(imageSrc);

        const img = new Image();
        img.src = imageSrc;

        img.onload = function () {
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
            }
            else
              setQrFind(false);
        };
    }, []);

    return (
        <div>
            {img === null ? (
                <div className='camera-container'>
                    <Camera
                        ref={cameraRef}
                        facingMode="environment"
                        aspectRatio={1}
                        errorMessages={{
                            noCameraAccessible: "Доступ к камере не разрешен",
                            permissionDenied: "Разрешение отклонено",
                            switchCamera: "Ошибка переключения камеры",
                            canvas: "Ошибка canvas"
                        }}
                    />
                    <center>
                        <button className='link' onClick={capture}>Сканировать</button>
                    </center>
                </div>
            ) : (
                <div className="camera-container">
                    <img src={img} alt="screenshot" />
                    <center>
                        <button className='link' onClick={() => setImg(null)}>Заново</button>
                    </center>
                    {qrfind && (
                        <>
                            <h1>QR-code найден</h1>
                            <center>
                                <a className='link' href={codeData}>Ссылка на объект</a>
                            </center>
                        </>
                    )}
                    {!qrfind && <h1>QR-code не найден</h1>}
                </div>
            )}
        </div>
    );
};