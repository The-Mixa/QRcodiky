import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from "jsqr";

export default function CameraComponent({ setTitle }) {
    const [img, setImg] = useState(null);
    const [qrfind, setQrFind] = useState(false);
    const [codeData, setCodeData] = useState("");
    const [hasPermission, setHasPermission] = useState(null);
    const [error, setError] = useState(null);
    const webcamRef = useRef(null);
    
    const videoConstraints = {
        facingMode: "environment",
        width: 500,
        height: 500 
    };

    useEffect(() => {
        setTitle("Сканирование QR");
        checkSavedPermissions();
    }, [setTitle]);

    const checkSavedPermissions = async () => {
        try {
            const savedPermission = localStorage.getItem('cameraPermission');
            if (savedPermission === 'granted') {
                const permission = await checkCameraPermission();
                if (permission === 'granted') {
                    setHasPermission(true);
                    return;
                }
            }
            setHasPermission(false);
        } catch (err) {
            setError(err);
            setHasPermission(false);
        }
    };

    const checkCameraPermission = async () => {
        if (!navigator.permissions) return 'prompt';
        try {
            const permission = await navigator.permissions.query({ name: 'camera' });
            return permission.state;
        } catch {
            return 'prompt';
        }
    };

    const requestCameraAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: videoConstraints 
            });
            
            localStorage.setItem('cameraPermission', 'granted');
            setHasPermission(true);
            
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            localStorage.removeItem('cameraPermission');
            setError(err);
            setHasPermission(false);
        }
    };

    const capture = useCallback(() => {
        if (!hasPermission || !webcamRef.current) return;
        
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

            if (code){
                setCodeData(code.data);
                setQrFind(true);
            }
            else
                setQrFind(false);
        };
    }, [hasPermission]);

    useEffect(() => {
        let permissionStatus;
        const trackPermissionChanges = async () => {
            try {
                if (!navigator.permissions) return;
                
                permissionStatus = await navigator.permissions.query({ name: 'camera' });
                permissionStatus.onchange = () => {
                    if (permissionStatus.state === 'granted') {
                        localStorage.setItem('cameraPermission', 'granted');
                        setHasPermission(true);
                    } else {
                        localStorage.removeItem('cameraPermission');
                        setHasPermission(false);
                    }
                };
            } catch (error) {
                console.error('Permission tracking error:', error);
            }
        };

        trackPermissionChanges();
        return () => {
            if (permissionStatus) permissionStatus.onchange = null;
        };
    }, []);

    if (error) {
        return (
            <div className="error">
                <p>Ошибка доступа: {error.message}</p>
                <button onClick={requestCameraAccess}>Попробовать снова</button>
            </div>
        );
    }

    if (hasPermission === null) {
        return <div>Проверка разрешений...</div>;
    }

    if (!hasPermission) {
        return (
            <center>
                <div className="permission-request">
                    <p>Для работы сканера требуется доступ к камере</p>
                    <button className="link" onClick={requestCameraAccess}>
                        Разрешить доступ
                    </button>
                </div>
            </center>
        );
    }

    return (
        <div>
            {img === null ? (
                <div className='camera-container'>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        onUserMediaError={(err) => {
                            setError(err);
                            setHasPermission(false);
                        }}
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