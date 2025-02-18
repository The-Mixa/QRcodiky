import React, {useState, useRef, useCallback} from 'react';
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import jsQR from "jsqr";


export default function Camera() {
    const [img, setImg] = useState(null);
    const [qrfind, setQrFind] = useState(false);
    const [codeData, setCodeData] = useState("");
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const videoConstarins = {
        width: {min: 400, max:400},
        height: {min: 400, max: 400},
        // facingMode: { exact: "environment" }
        facingMode: "user"
    }

    const capture = useCallback(() => {
      const imageSrc = webcamRef.current.getScreenshot();
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
        } else {
          setQrFind(false);
        }
      };

      
    }, [webcamRef]);
    
    return (
        <div>
        <h1>
            Камера
        </h1>
        {img === null ? (
        <>
            <Webcam
                audio={false}
                screenshotFormat='image/jpeg'
                ref={webcamRef}
                videoConstraints={videoConstarins}
            />

          <button onClick={capture}>Capture photo</button>
        </>
      ) : (
        <>
          <img src={img} alt="screenshot" />
          <button onClick={() => setImg(null)}>Retake</button>
          {qrfind && 
          <>
            <h1>QR-code найден</h1>
            <a href={codeData}>Ссылка на объект</a>
          </>
          
          }
          {!qrfind && 
            <h1>QR-code не найден</h1>
          }
          

        </>
      )}
        </div>
    );
};