import axios from 'axios'
import '../../styles/Modal.css'
import { toast } from 'react-toastify'
import * as Io5Icons from 'react-icons/io5'
import React, { useState, useEffect } from 'react'
import api from '../../../Backend/config/api';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem} from '@mui/material';

const providerModal = ({ open, onClose, fetchProvider, mode, providerData }) => {
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (mode === 'edit' && providerData) {
      setDocumentType(providerData.documentType);
      setDocumentNumber(providerData.documentNumber);
      setCompanyName(providerData.companyName);
      setSupplier(providerData.supplier);
      setPhone(providerData.phone);
      setEmail(providerData.email);
      setStatus(providerData.status);
    }
  }, [mode, providerData]);

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        await api.post('/provider', {
          documentType,
          documentNumber,
          companyName,
          supplier,
          phone,
          email: email.trim() === '' ? null : email,
          status,
        });
        toast.success('Proveedor creado exitosamente');
      } else if (mode === 'edit') {
        await api.put(`/provider/${providerData.id}`, {
          documentType,
          documentNumber,
          companyName,
          supplier,
          phone,
          email,
          status,
        });
        toast.success('Proveedor editado exitosamente');
      }

      fetchProvider();
      onClose();
    } catch (error) {
      console.error('Error al procesar el proveedor:', error);

      // Verifica si la respuesta del servidor tiene un mensaje de error
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Muestra el mensaje específico del backend
      } else {
        toast.error('Error al procesar el proveedor');
      }
    }
  };

  useEffect(() => {
    if (!open) {
      setDocumentType('');
      setDocumentNumber('');
      setCompanyName('');
      setSupplier('');
      setPhone('');
      setEmail('');
      setStatus('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="modalHeader">
      <DialogTitle>{mode === 'create' ? 'Registrar Proveedor' : 'Editar Proveedor'}</DialogTitle>
        <Io5Icons.IoClose onClick={onClose} className="iconClosedModal" />
      </div>

      <DialogContent>
        <div className="contentModal">

          <TextField
            required
            name="companyName"
            label="Marca"
            value={companyName}
            color="success"
            variant="outlined"
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <TextField
            required
            name="supplier"
            label="Vendedor"
            value={supplier}
            color="success"
            variant="outlined"
            onChange={(e) => setSupplier(e.target.value)}
          />

          <TextField
            required
            name="phone"
            label="Telefono"
            value={phone}
            color="success"
            variant="outlined"
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* <TextField
            name="email"
            label="Correo"
            value={email}
            color="success"
            variant="outlined"
            onChange={(e) => setEmail(e.target.value)}
          /> */}

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
      </DialogContent>
      <DialogActions>
        <button onClick={handleSubmit} className="btnRegisterModal">
          {mode === 'create' ? 'Registrar' : 'Actualizar'}
        </button>
      </DialogActions>
    </Dialog >
  )
}

export default providerModal
