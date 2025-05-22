import '../../App.css'
import axios from 'axios'
import '../../styles/Modal.css'
import { toast } from 'react-toastify'
import * as Io5Icons from 'react-icons/io5'
import React, { useState, useEffect } from 'react'
import api from '../../../Backend/config/api';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';

const categoryModal = ({ open, onClose, fetchCategories, mode, categoriesData }) => {
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (mode === 'edit' && categoriesData) {
      setCategory(categoriesData.category);
      setStatus(categoriesData.status);
    }
  }, [mode, categoriesData]);

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        await api.post('/categories', {
          category,
          status,
        });
        toast.success('Categoría creada exitosamente');
      } else if (mode === 'edit') {
        await api.put(`/categories/${categoriesData.id}`, {
          category,
          status
        });
        toast.success('Categoría editada exitosamente');
      }
      fetchCategories();
      onClose();
    } catch (error) {
      console.error('Error al procesar la categoria:', error);

      // Verifica si la respuesta del servidor tiene un mensaje de error
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Muestra el mensaje específico del backend
      } else {
        toast.error('Error al procesar la cetegoría');
      }
    }
  };

  useEffect(() => {
    if (!open) {
      setCategory('');
      setStatus('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="modalHeader">
        <DialogTitle>{mode === 'create' ? 'Registrar Categoría' : 'Editar Ctegoría'}</DialogTitle>
        <Io5Icons.IoClose onClick={onClose} className='iconClosedModal' />
      </div>
      <DialogContent>
        <div className="contentModal">
          <TextField
            required
            name='category'
            label='Categoria'
            value={category}
            color='success'
            variant='outlined'
            onChange={(e) => setCategory(e.target.value)}
          />
          <TextField
            select
            required
            id='outlined-select'
            label='Estado'
            value={status}
            variant='outlined'
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

export default categoryModal;
