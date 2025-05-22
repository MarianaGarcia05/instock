import React, { useState, useEffect } from 'react';
import '../styles/EditProfile.css';
import * as FaIcons from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../Backend/config/api';
import { ToastContainer } from 'react-toastify';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { TextField, MenuItem, FormControl, InputLabel, Avatar, InputAdornment, IconButton, Input, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [userData, setUserData] = useState({
    documentType: '',
    documentNumber: '',
    names: '',
    surnames: '',
    email: '',
    password: '',
    role_id: '',
    status: 'active',
    avatar: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const avatars = [
    { id: 'avatar1', src: '/avatars/avatar1.png', alt: 'Avatar 1' },
    { id: 'avatar2', src: '/avatars/avatar2.png', alt: 'Avatar 2' },
    { id: 'avatar3', src: '/avatars/avatar3.png', alt: 'Avatar 3' },
    { id: 'avatar4', src: '/avatars/avatar4.png', alt: 'Avatar 4' },
  ];

  //Listar roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setRoles(response.data); 
      } catch (error) {
        console.error('Error al obtener roles:', error);
      }
    };
    fetchRoles();
  }, []);


  useEffect(() => {
    const fetchUserData = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No hay token almacenado');
    return;
  }

  try {
    const response = await api.get('/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const newToken = response.headers['Authorization'];
    if (newToken) {
      localStorage.setItem('token', newToken.split(' ')[1]);
    }

    if (response.status !== 200) {
      throw new Error('Error al obtener datos del usuario');
    }

    setUserData(response.data);
    setSelectedAvatar(response.data.avatar);
  } catch (error) {
    console.error('Error:', error);
  }
};

    fetchUserData();
  }, [id]);


  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token'); // Obtener token actualizado

    const updatedData = {
      ...userData,
      avatar: selectedAvatar,
    };

    console.log("Datos a enviar:", updatedData);

    api.put(`/users/update/profile/${id}`, updatedData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // usar token actualizado
      },
      body: JSON.stringify(updatedData),
    })
      .then(async response => {
        // Si viene nuevo token, actualizarlo también aquí
        const newToken = response.headers.get('Authorization');
        if (newToken) {
          localStorage.setItem('token', newToken.split(' ')[1]);
        }

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Perfil editado',
            text: data.message,
            confirmButtonColor: '#00891B',
            confirmButtonText: 'Aceptar'
          });
          navigate(`/dashboard/editProfile/${id}`);
        } else {
          toast.error(data.error || data.message || 'Error al actualizar el perfil');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        toast.error('Ocurrió un error al actualizar el perfil');
      });
  };


  return (
    <div className="contentEdit">
      <form className="contentEditProfile" onSubmit={handleSubmit}>
        <h3>
          <FaIcons.FaUserEdit /> Editar perfil
        </h3>
        <div className='formEditProfile'>
          <TextField
            select
            required
            value={userData.documentType}
            onChange={(e) => setUserData({ ...userData, documentType: e.target.value })}
            id="outlined-select"
            label="Tipo de documento"
            variant="standard"
            color="success"
          >
            <MenuItem value="CC">CC</MenuItem>
            <MenuItem value="CE">CE</MenuItem>
            <MenuItem value="TI">TI</MenuItem>
          </TextField>

          <TextField
            required
            name="documentNumber"
            label="N° documento"
            color="success"
            variant="standard"
            value={userData.documentNumber}
            onChange={(e) => setUserData({ ...userData, documentNumber: e.target.value })}
          />

          <TextField
            required
            name="names"
            label="Nombres"
            color="success"
            variant="standard"
            value={userData.names}
            onChange={(e) => setUserData({ ...userData, names: e.target.value })}
          />

          <TextField
            required
            name="surnames"
            label="Apellidos"
            color="success"
            variant="standard"
            value={userData.surnames}
            onChange={(e) => setUserData({ ...userData, surnames: e.target.value })}
          />

          <TextField
            required
            name="email"
            label="Correo"
            color="success"
            variant="standard"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          />

          <FormControl sx={{ width: '27ch' }} variant="standard" color="success">
            <InputLabel htmlFor="standard-adornment-password">Contraseña</InputLabel>
            <Input
              required
              name="password"
              label="contraseña"
              id="standard-adornment-password"
              type={showPassword ? 'text' : 'password'}
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'hide the password' : 'display the password'}
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <TextField
            select
            disabled
            required
            name="role_id"
            label="Rol"
            color="success"
            variant="standard"
            value={userData.role_id}
            onChange={(e) => setUserData({ ...userData, role_id: e.target.value })}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.rol}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            disabled
            required
            id="standard-select"
            label="Estado"
            variant="standard"
            color="success"
            value={userData.status}
            onChange={(e) => setUserData({ ...userData, status: e.target.value })}
          >
            <MenuItem value="active">Activo</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
          </TextField>
        </div>

        {/* Sección de selección de avatar */}
        <div className="avatar">
          <h4>Seleccionar un avatar</h4>
          <RadioGroup
            row
            required
            value={selectedAvatar}
            onChange={(e) => setSelectedAvatar(e.target.value)}
            aria-label="avatar-selection"
            sx={{
              mt: 3,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              justifyItems: 'center',
              alignItems: 'center',
            }}
          >
            {avatars.map((avatar) => (
              <FormControlLabel
                key={avatar.id}
                value={avatar.src}
                control={
                  <Radio
                    sx={{
                      '&.Mui-checked': {
                        color: '#145A32',
                      },
                    }}
                  />
                }
                label={
                  <Avatar
                    src={avatar.src}
                    alt={avatar.alt}
                    sx={{
                      width: 70,
                      height: 70,
                    }}
                  />
                }
                labelPlacement="top"
              />
            ))}
          </RadioGroup>
          <ToastContainer />
        </div>

        <button className='btnUpdate' type="submit">Actualizar</button>
      </form>
    </div>
  );
}

export default EditProfile;
