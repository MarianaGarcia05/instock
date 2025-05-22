import '../../App.css'
import axios from 'axios'
import '../../styles/Modal.css'
import { toast } from 'react-toastify'
import * as Io5Icons from 'react-icons/io5'
import React, { useState, useEffect } from 'react'
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, RadioGroup, Radio, Input, FormControlLabel, Avatar } from '@mui/material';

const userModal = ({ open, onClose, fetchUsers, mode, userData }) => {
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [names, setNames] = useState('');
  const [surnames, setSurnames] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role_id, setRole_id] = useState('');
  const [status, setStatus] = useState('');
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = React.useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const avatars = [
    { id: 'avatar1', src: '/avatars/avatar1.png', alt: 'Avatar 1' },
    { id: 'avatar2', src: '/avatars/avatar2.png', alt: 'Avatar 2' },
    { id: 'avatar3', src: '/avatars/avatar3.png', alt: 'Avatar 3' },
    { id: 'avatar4', src: '/avatars/avatar4.png', alt: 'Avatar 4' },
  ];

  const handleAvatarChange = (event) => {
    setSelectedAvatar(event.target.value);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/roles');
        setRoles(data);
      } catch (error) {
        console.error('Error al obtener roles:', error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && userData) {
      setDocumentType(userData.documentType);
      setDocumentNumber(userData.documentNumber);
      setNames(userData.names);
      setSurnames(userData.surnames);
      setEmail(userData.email);
      setPassword(userData.password);
      setRole_id(userData.role_id);
      setStatus(userData.status);
      setSelectedAvatar(userData.avatar);
    }
  }, [mode, userData]);

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        await axios.post('http://localhost:3000/api/users', {
          documentType,
          documentNumber,
          names,
          surnames,
          email,
          password,
          role_id,
          status,
          avatar: selectedAvatar, // Guardar solo el avatar seleccionado
        });
        toast.success('Usuario creado exitosamente');
      } else if (mode === 'edit') {
        await axios.put(`http://localhost:3000/api/users/${userData.id}`, {
          documentType,
          documentNumber,
          names,
          surnames,
          email,
          password,
          role_id,
          status,
          avatar: selectedAvatar, // Guardar solo el avatar seleccionado
        });
        toast.success('Usuario editado exitosamente');
      }

      fetchUsers();
      onClose();
    } catch (error) {
      console.error('Error al procesar el usuario:', error);

      // Verifica si la respuesta del servidor tiene un mensaje de error
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Muestra el mensaje específico del backend
      } else {
        toast.error('Error al procesar el usuario');
      }
    }
  };

  useEffect(() => {
    if (!open) {
      setDocumentType('');
      setDocumentNumber('');
      setNames('');
      setSurnames('');
      setEmail('');
      setPassword('');
      setRole_id('');
      setStatus('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="modalHeader">
        <DialogTitle>{mode === 'create' ? 'Registrar usuario' : 'Editar usuario'}</DialogTitle>
        <Io5Icons.IoClose onClick={onClose} className="iconClosedModal" />
      </div>
      <DialogContent>
        <div className="contentModal">
          <TextField
            select
            required
            id="outlined-select"
            label="Tipo de documento"
            value={documentType}
            variant="outlined"
            color="success"
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <MenuItem value="CC">CC</MenuItem>
            <MenuItem value="CE">CE</MenuItem>
            <MenuItem value="TI">TI</MenuItem>
          </TextField>

          <TextField
            required
            name="documentNumber"
            label="N° documento"
            value={documentNumber}
            color="success"
            variant="outlined"
            onChange={(e) => setDocumentNumber(e.target.value)}
          />

          <TextField
            required
            name="names"
            label="Nombres"
            value={names}
            color="success"
            variant="outlined"
            onChange={(e) => setNames(e.target.value)}
          />

          <TextField
            required
            name="surnames"
            label="Apellidos"
            value={surnames}
            color="success"
            variant="outlined"
            onChange={(e) => setSurnames(e.target.value)}
          />

          <TextField
            required
            name="email"
            label="Correo"
            value={email}
            color="success"
            variant="outlined"
            onChange={(e) => setEmail(e.target.value)}
          />

          <FormControl sx={{ width: '27ch' }} variant="outlined" color="success">
            <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
            <OutlinedInput
              required
              name="password"
              label="contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
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
            required
            name="role_id"
            label="Rol"
            value={role_id}
            color="success"
            variant="outlined"
            onChange={(e) => setRole_id(e.target.value)}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.rol}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            required
            id="outlined-select"
            label="Estado"
            value={status}
            variant="outlined"
            color="success"
            onChange={(e) => setStatus(e.target.value)}
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
            onChange={handleAvatarChange}
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
        </div>
      </DialogContent>
      <DialogActions>
        <button onClick={handleSubmit} className="btnRegisterModal">
          {mode === 'create' ? 'Registrar' : 'Actualizar'}
        </button>
      </DialogActions>
    </Dialog>
  );
};


export default userModal;
