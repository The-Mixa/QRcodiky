import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import WorkList from './WorkList';
import { refresh } from './refresh';

const ObjectDetails = ({ refreshToken, isStaff, setTitle, registered, setUserIsStaff }) => {
  const navigate = useNavigate();
  if (!registered)
    navigate('/');
  const { objectId } = useParams();
  const [objectStatus, setObjectStatus] = useState(null);
  const [userWorks, setUserWorks] = useState([]);
  const [allWorks, setAllWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = async () => {
    try {
      const accessToken = refresh(refreshToken);
      return {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      };
    } catch (error) {
      throw new Error('Ошибка авторизации');
    }
  };

  useEffect(() =>{
    var access_token = refresh(localStorage.getItem("refresh_token"));
    if (access_token != null) {
      axios.get(`http://${process.env.REACT_APP_HOST}:8000/api/v1/auth/status/`, {
        headers: {
          "authorization": `Bearer ${access_token}`
        }
      })
        .then((response) => {
          if (response['data']['status'] === "user")
            setUserIsStaff(false);
          else
            setUserIsStaff(true);
        });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authConfig = await getAuthHeader();
        const statusResponse = await axios.get(
          `http://${process.env.REACT_APP_HOST}:8000/api/v1/object/status/${objectId}/`,
          authConfig
        );
        setObjectStatus(statusResponse.data);
        setTitle(statusResponse.data.object.name);

        console.log(isStaff);
        if (isStaff) {
          console.log(1);

          const worksResponse = await axios.get(
            `http://${process.env.REACT_APP_HOST}:8000/api/v1/object/work-history/${objectId}/`,
            authConfig
          );

          setAllWorks(worksResponse.data.filter((work) => work.end_time !== null && work.review === null));
        } else {
          console.log(2);

          const userWorksResponse = await axios.get(
            `http://${process.env.REACT_APP_HOST}:8000/api/v1/user/works/`,
            authConfig
          ).catch((error) => {
            if (error.status === 404){
              console.log(":(");
            }
          })
          setUserWorks(userWorksResponse.data.filter((work) => work.end_time === null && work.review === null));
        }
      } catch (error) {
        setError(error.status);
        setTitle("Ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [objectId, refreshToken]);

  

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return (
    <div>
      <center>
        {error == 404 && <p>Объекта не существует</p>}
        {error == 403 && <p>У вас нету доступа к этому объекту</p>}
        <p>Обратитесь к администратору</p>
        
        <NavLink to="/" className="link" >
          На главную
        </NavLink>
      </center>
    </div>
    );
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