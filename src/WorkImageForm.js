import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refresh } from './refresh';
import axios from "axios";
import './App.css';

const WorkImageForm = ({ workId, setTitle }) => {
    const [description, setDescription] = useState("");
    const [workName, setWorkName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [comment, setComment] = useState(""); // Для отправки комментария

    const navigate = useNavigate();
  
    const getAuthHeader = async () => {
      try {
        const accessToken = refresh(localStorage.getItem("refresh_token"));
        return {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        };
      } catch (error) {
        throw new Error('Ошибка авторизации');
      }
    };

    // Загрузка информации о работе при монтировании
    useEffect(() => {
      const fetchWorkDetails = async () => {
        try {
          const authConfig = await getAuthHeader();
          const response = await axios.get(
            `${process.env.REACT_APP_HOST}/api/v1/info/${workId}/`,
            authConfig
          );

          // Устанавливаем данные о работе
          setWorkName(response.data.name);
          setTaskDescription(response.data.description);
          setDescription(response.data.description);
          setTitle(response.data.name);

          // Загружаем изображения
          const imagesResponse = await axios.get(
            `${process.env.REACT_APP_HOST}/api/v1/image_work/${workId}/list/`,
            authConfig
          );
          setImages(imagesResponse.data);
        } catch (error) {
          setError(error.message);
        }
      };

      fetchWorkDetails();
    }, [workId, setTitle]);

    // Отправка изображения
    const handleAddImage = async () => {
      if (!selectedFile) return;
  
      setUploading(true);
      try {
        const authConfig = await getAuthHeader();
        const formData = new FormData();
        formData.append('image', selectedFile);
  
        const response = await axios.post(
          `${process.env.REACT_APP_HOST}/api/v1/image_work/${workId}/`,
          formData,
          authConfig
        );
  
        setImages([...images, {
          ...response.data,
          preview: URL.createObjectURL(selectedFile)
        }]);
        
      } catch (error) {
        setError(error.message);
      } finally {
        setUploading(false);
        setSelectedFile(null);
      }
    };

    // Отправка комментария и завершение работы
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
  
        navigate(-1); // Возвращаемся на предыдущую страницу
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="work-image-form">
        {error && <div className="form-error">{error}</div>}
        
        <form className="work-form" onSubmit={handleComplete}>
          <div className="form-group">
            <label className="form-label">
              <b>Название работы:</b> {workName || 'Загрузка...'}
            </label>
            <label className="form-label">
              <b>Описание работы:</b> {taskDescription || 'Загрузка...'}
            </label>
            <label className="form-label">
              Комментарий к работе:
            </label>
            <textarea
                className="form-textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
          </div>
    
          <div className="file-input-container">
            <label className="file-input-label">
              Выберите изображение:
            </label>
            <input
                className="file-input"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept="image/*"
            />
            <button 
              className="upload-button"
              type="button"
              onClick={handleAddImage}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Загрузка...' : 'Добавить'}
            </button>
          </div>
    
          <button 
            className="submit-button"
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Обработка...' : 'Завершить работу'}
          </button>
        </form>
    
        <div className="image-gallery">
          {!images ? <p>Изображений нет</p> :
          <>
            <h2 className="gallery-title">Загруженные изображения:</h2>
            <div className="image-grid">
              {images.map(image => (
                <div className="image-card" key={image.id}>
                  <img 
                    className="image-preview"
                    src={image.preview || `${process.env.REACT_APP_HOST}${image.image}`} 
                    alt={`Изображение ${image.id}`}
                  />
                  <p className="upload-date">
                    Загружено: {new Date(image.uploaded_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </>}
        </div>
      </div>
    );
};

export default WorkImageForm;
