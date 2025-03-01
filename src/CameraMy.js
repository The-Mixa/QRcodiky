import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from "jsqr";

export default function CameraComponent({ setTitle }) {
    const [img, setImg] = useState(null);
    const [qrfind, setQrFind] = useState(false);
    const [codeData, setCodeData] = useState("");
    const webcamRef = useRef(null);
    
    const videoConstraints = {
        facingMode: "environment",
        width: 500,
        height: 500 
    };

    useEffect(() => setTitle("Камера"));

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;
        
        setImg(imageSrc);

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
            } else {
                setQrFind(false);
            }
        };
    }, []);

    return (
        <div>
            {img === null ? (
                <div className='camera-container'>
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
                    {qrfind ? (
                        <>
                            <h1>QR-code найден</h1>
                            <center>
                                <a className='link' href={codeData}>Ссылка на объект</a>
                            </center>
                        </>
                    ) : <h1>QR-code не найден</h1>}
                </div>
            )}
        </div>
    );
};