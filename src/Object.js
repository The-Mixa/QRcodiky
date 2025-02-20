import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import WorkList from './WorkList';
import { refresh } from './refresh';

const ObjectDetails = ({ refreshToken, isStaff, setTitle }) => {
  const { objectId } = useParams();
  const [objectStatus, setObjectStatus] = useState(null);
  const [userWorks, setUserWorks] = useState([]);
  const [allWorks, setAllWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authConfig = await getAuthHeader();
        const statusResponse = await axios.get(
          `http://127.0.0.1:8000/api/v1/object/status/${objectId}/`,
          authConfig
        );
        setObjectStatus(statusResponse.data);
        setTitle(statusResponse.data.object.name);


        if (isStaff) {
          const worksResponse = await axios.get(
            `http://127.0.0.1:8000/api/v1/object/work-history/${objectId}/`,
            authConfig
          );
          setAllWorks(worksResponse.data.filter((work) => work.end_time !== null && work.review === null));
        } else {
          const userWorksResponse = await axios.get(
            `http://127.0.0.1:8000/api/v1/user/works/`,
            authConfig
          );
          setUserWorks(userWorksResponse.data.filter((work) => work.end_time === null && work.review === null));
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [objectId, refreshToken, isStaff]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div>
      {objectStatus && (
        <div style={{marginLeft:"20px"}}>
          <p>Адрес: {objectStatus.object.address}</p>
        </div>
      )}
      {isStaff ? (
        <>
        {!allWorks ?  <p>нет работ на оценку</p> :
        <WorkList works={allWorks} isStaff={true} />
        }
        </> 
      ) : (
        <>
        {!userWorks ?  <p>работы нету</p> :
        <WorkList works={userWorks} isStaff={false} />
        }
        </>
      )}
    </div>
  );
};

export default ObjectDetails;