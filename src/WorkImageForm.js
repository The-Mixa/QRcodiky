import React, {useState, useEffect} from "react";
import { refresh } from './refresh';
import axios from "axios";
import './App.css';


const WorkImageForm = ({ workDescription, workId, refreshToken, setTitle }) => {
    const [description, setDescription] = useState(workDescription);
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    
  
    const getAuthHeader = async () => {
      try {
        const accessToken = await refresh(refreshToken);
        return {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        };
      } catch (error) {
        throw new Error('Ошибка авторизации');
      }
    };
  
    // Загрузка существующих изображений при монтировании
    useEffect(() => {
      const fetchImages = async () => {
        try {
          const authConfig = await getAuthHeader();
          const response = await axios.get(
            `http://127.0.0.1:8000/api/v1/image_work/${workId}/list/`,
            authConfig
          );
          setImages(response.data);
        } catch (error) {
          setError(error.message);
        }
      };
  
      fetchImages();
    }, [workId, refreshToken]);
  
    // Отправка изображения сразу при добавлении
    const handleAddImage = async () => {
      if (!selectedFile) return;
  
      setUploading(true);
      try {
        const authConfig = await getAuthHeader();
        const formData = new FormData();
        formData.append('image', selectedFile);
  
        const response = await axios.post(
          `http://127.0.0.1:8000/api/v1/image_work/${workId}/`,
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
  
    // Отправка описания работы
    const handleComplete = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
        const authConfig = await getAuthHeader();
        await axios.post(
          'http://127.0.0.1:8000/api/v1/end/',
          { work_id: Number(workId), description: description },
          authConfig
        );
  
        alert('Работа успешно завершена!');
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
              Описание работы:
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </div>
    
          <div className="file-input-container">
            <label className="file-input-label">
              Выберите изображение:
              <input
                className="file-input"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept="image/*"
              />
            </label>
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
          <h2 className="gallery-title">Загруженные изображения:</h2>
          <div className="image-grid">
            {images.map(image => (
              <div className="image-card" key={image.id}>
                <img 
                  className="image-preview"
                  src={image.preview || "http://127.0.0.1:8000" + image.image} 
                  alt={`Изображение ${image.id}`}
                />
                <p className="upload-date">
                  Загружено: {new Date(image.uploaded_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

export default WorkImageForm;