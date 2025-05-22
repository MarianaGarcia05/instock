import '../../App.css'
import axios from 'axios'
import '../../styles/Modal.css'
import { toast } from 'react-toastify'
import * as Io5Icons from 'react-icons/io5'
import React, { useState, useEffect } from 'react'
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';

const rolModal = ({ open, onClose, fetchRoles, mode, roleData }) => {
  const [rol, setRol] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (mode === 'edit' && roleData) {
      setRol(roleData.rol);
      setStatus(roleData.status);
    }
  }, [mode, roleData]);

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        await axios.post('http://localhost:3000/api/roles', {
          rol,
          status
        });
        toast.success('Rol creada exitosamente');
      } else if (mode === 'edit') {
        await axios.put(`http://localhost:3000/api/roles/${roleData.id}`, {
          rol,
          status
        });
        toast.success('Rol editado exitosamente');
      }
      fetchRoles();
      onClose();
    } catch (error) {
      console.error('Error al procesar el rol:', error);
      // Verifica si la respuesta del servidor tiene un mensaje de error
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Muestra el mensaje específico del backend
      } else {
        toast.error('Error al procesar el rol');
      }
    }
  };

  // Limpiar campos cuando el modal se cierra
  useEffect(() => {
    if (!open) {
      setRol('');
      setStatus('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="modalHeader">
        <DialogTitle>{mode === 'create' ? 'Registrar Rol' : 'Editar Rol'}</DialogTitle>
        <Io5Icons.IoClose onClick={onClose} className='iconClosedModal' />
      </div>
      <DialogContent>
        <div className="contentModal">
          <TextField
            required
            name="rol"
            label="Rol"
            value={rol}
            color='success'
            variant="outlined"
            onChange={(e) => setRol(e.target.value)}
          />
          <TextField
            select
            required
            id='outlined-select'
            label="Estado"
            value={status}
            variant="outlined"
            color='success'
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="active">Activo</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
          </TextField>
        </div>
      </DialogContent>
      <DialogActions>
        <button onClick={handleSubmit} className="btnRegisterModal">
          {mode === 'create' ? 'Registrar' : 'Actualizar'}
        </button>
      </DialogActions>
    </Dialog>
  )
}

export default rolModal;
