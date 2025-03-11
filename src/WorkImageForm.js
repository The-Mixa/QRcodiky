import React, { useState, useEffect } from "react";
import { refresh } from './refresh';
import axios from "axios";
import './App.css';

const WorkImageForm = ({ workId, setTitle, onComplete }) => {
    const [description, setDescription] = useState("");
    const [workName, setWorkName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [comment, setComment] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);

    const getAuthHeader = async () => {
        try {
            const accessToken = await refresh(localStorage.getItem("refresh_token"));
            return {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            };
        } catch (error) {
            throw new Error('Ошибка авторизации');
        }
    };

    useEffect(() => {
        const fetchWorkDetails = async () => {
            try {
                const authConfig = await getAuthHeader();
                const response = await axios.get(
                    `${process.env.REACT_APP_HOST}/api/v1/info/${workId}/`,
                    authConfig
                );

                setWorkName(response.data.name);
                setTaskDescription(response.data.description);
                setDescription(response.data.description);
                
                const imagesResponse = await axios.get(
                    `${process.env.REACT_APP_HOST}/api/v1/image_work/${workId}/list/`,
                    authConfig
                );
                setImages(imagesResponse.data.map(img => ({
                    ...img,
                    preview: `${process.env.REACT_APP_HOST}${img.image}`
                })));
            } catch (error) {
                setError(error.message);
            }
        };

        fetchWorkDetails();
    }, [workId]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const tempImage = {
            id: `temp-${Date.now()}`,
            preview: URL.createObjectURL(file),
            isUploading: true,
            error: null
        };

        setImages(prev => [tempImage, ...prev]);

        try {
            const authConfig = await getAuthHeader();
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post(
                `${process.env.REACT_APP_HOST}/api/v1/image_work/${workId}/`,
                formData,
                authConfig
            );

            setImages(prev =>
                prev.map(img =>
                    img.id === tempImage.id
                        ? { ...response.data, preview: tempImage.preview }
                        : img
                )
            );
        } catch (error) {
            setImages(prev =>
                prev.map(img =>
                    img.id === tempImage.id
                        ? { ...img, error: error.message, isUploading: false }
                        : img
                )
            );
        } finally {
            e.target.value = null;
        }
    };

    const handleComplete = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const authConfig = await getAuthHeader();
            await axios.post(
                `${process.env.REACT_APP_HOST}/api/v1/end/`,
                { work_id: Number(workId), comment: comment },
                authConfig
            );

            if (onComplete) onComplete();
            
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="work-image-form">
            {error && <div className="form-error">{error}</div>}
            <br />
            <form className="work-form" onSubmit={handleComplete}>
                <div className="form-group form-heading">
                    <label className="form-label-1">
                        <b>Название работы:</b> {workName || 'Загрузка...'}
                    </label>
                    <br />
                    <label className="form-label-1">
                        <b>Описание работы:</b> {taskDescription || 'Загрузка...'}
                    </label>
                </div>
                <br />
                <br />

                <div className="file-input-container">
                    <div className="thumbnails">
                        {images.map(image => (
                            <div 
                                key={image.id} 
                                className="thumbnail"
                                onClick={() => setSelectedImage(image.preview)}
                            >
                                <img 
                                    src={image.preview} 
                                    alt="thumbnail" 
                                    className="thumbnail-image"
                                />
                                {image.isUploading && (
                                    <div className="upload-status">Загрузка...</div>
                                )}
                                {image.error && (
                                    <div className="upload-error">Ошибка</div>
                                )}
                            </div>
                        ))}
                    </div>
                    <label className="file-input-label">
                        Выберите изображение:
                        <input
                            className="file-input"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </label>
                </div>

                <label className="form-label form-comment">
                    Комментарий к работе:
                </label>
                <textarea
                    className="form-textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <button 
                    className="submit-button"
                    type="submit" 
                    disabled={loading}
                >
                    {loading ? 'Обработка...' : 'Завершить работу'}
                </button>
            </form>

            {selectedImage && (
                <div 
                    className="fullscreen-overlay" 
                    onClick={() => setSelectedImage(null)}
                >
                    <img 
                        src={selectedImage} 
                        alt="fullscreen" 
                        className="fullscreen-image" 
                    />
                </div>
            )}
        </div>
    );
};

export default WorkImageForm;