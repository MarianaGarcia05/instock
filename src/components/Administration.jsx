import '../App.css';
import React, { useState, useEffect } from 'react';
import '../styles/Administration.css';
import * as Io5Icons from 'react-icons/io5';
import * as TbIcons from 'react-icons/tb';
import * as Fa6Icons from 'react-icons/fa6';
import * as AiIcons from 'react-icons/ai';
import baseData from '../json/Administration.json';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Administration = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(baseData);
  const navigate = useNavigate();
  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo && userInfo !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al parsear los datos del usuario:', error);
      }
    } else {
      console.log('No se encontró información de usuario en localStorage');
    }

    // Obtener los datos dinámicos del backend
    axios
      .get('http://localhost:3000/api/counter/counts')
      .then((response) => {
        const countsData = response.data;

        // Actualizar los datos base con los valores obtenidos del backend
        const updatedData = baseData.map((item) => {
          switch (item.name) {
            case 'Proveedores':
              return { ...item, number: countsData.Proveedores || 0 };
            case 'Categorías':
              return { ...item, number: countsData.Categorias || 0 };
            case 'Usuarios':
              return { ...item, number: countsData.Usuarios || 0 };
            case 'Productos':
              return { ...item, number: countsData.Productos || 0 };
            case 'Movimientos':
              return { ...item, number: countsData.Movimientos || 0 };
            case 'Ventas':
              return { ...item, number: countsData.Ventas || 0 };
            case 'Reportes':
              return { ...item, number: countsData.Reportes || 0 };
            case 'Rol':
              return { ...item, number: countsData.Roles || 0 };
            default:
              return item;
          }
        });

        setData(updatedData);
      })
      .catch((error) => {
        console.error('Error al obtener los datos del backend:', error);
      });
  }, []);

  const iconMap = {
    FaTruckFast: <Fa6Icons.FaTruckFast />,
    TbCategoryFilled: <TbIcons.TbCategoryFilled />,
    FaUserGear: <Fa6Icons.FaUserGear />,
    IoCopy: <Io5Icons.IoCopy />,
    FaClipboardUser: <Fa6Icons.FaClipboardUser />,
    AiFillDollarCircle: <AiIcons.AiFillDollarCircle/>
  };

  const handleCardClick = (path) => {
    navigate(path); // Redirige a la ruta especificada
  };

  return (
    <div className="administrationContent">
      <h1 className="title">
        <Io5Icons.IoSettings className="iconTitle" /> Administración
      </h1>
      <p className="text">
        Buen día{' '}
        <b className="nameText">
          {user ? `${user.names}` : 'Cargando...'}
        </b>
        , te doy la bienvenida al panel de administración. Desde aquí podrás acceder a los distintos listados de cada módulo. <br /> 
        Además, tendrás la ozpción de gestionar la creación y configuración de los diferentes elementos disponibles en el sistema.
      </p>

      <div className="cardContent">
        {data.map((item, index) => (
          <div className="card" key={index} onClick={() => handleCardClick(item.path)}>
            <div className="content">
              <div className="header">
                <h2>{item.name}</h2>
              </div>
              <div className="icon">{iconMap[item.icon]}</div>
              <p>{item.number} registrados</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Administration;
