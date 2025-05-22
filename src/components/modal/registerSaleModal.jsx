import '../../App.css';
import axios from 'axios';
import '../../styles/Modal.css';
import { toast } from 'react-toastify';
import * as Io5Icons from 'react-icons/io5';
import React, { useState, useEffect } from 'react';
import api from '../../../Backend/config/api';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const RegisterSaleModal = ({ open, onClose, fetchSales, product }) => {
  const [amount, setAmount] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [user, setUser] = useState('');
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    if (product && product.salePrice) {
      setUnitCost(product.salePrice);
    }
  }, [product]);

  useEffect(() => {
    if (!open) {
      setAmount('');
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const providersRes = await api.get('/provider');
          setProviders(providersRes.data);

          // Obtener usuario logueado
          const loggedUser = JSON.parse(localStorage.getItem('user'));
          if (loggedUser) {
            setUser({ id: loggedUser.id, name: `${loggedUser.names} ${loggedUser.surnames}` });
          }

          // Establecer la fecha actual
          const today = new Date().toISOString().split('T')[0];
          setSaleDate(today);
        } catch (error) {
          console.error('Error al cargar datos:', error);
        }
      };
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (amount && unitCost) {
      setTotalCost(amount * unitCost);
    } else {
      setTotalCost('');
    }
  }, [amount, unitCost]);

  const handleSubmit = async () => {
    if (!product || !amount || !unitCost || !saleDate || !user) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    if (parseInt(amount) <= 0) {
      toast.error('La cantidad debe ser mayor a cero.');
      return;
    }

    // Validar stock disponible
    if (parseInt(amount) > parseInt(product.stock)) {
      toast.error('Stock insuficiente. Esa cantidad no está disponible en este momento.');
      return;
    }

    try {
      const response = await api.post('/sales', {
        product_id: product.id,
        provider_id: product.provider_id,
        amount,
        unitCost,
        totalCost,
        saleDate,
        expirationDate,
        user_id: user.id,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Venta registrada exitosamente');
        if (fetchSales) {
          fetchSales();
        }
        onClose();
      } else {
        toast.error('Error al registrar la venta');
      }
    } catch (error) {
      console.error('Error al registrar la venta:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error al registrar la venta');
    }
  };


  return (
    <Dialog open={open} onClose={onClose}>
      <div className="modalHeader">
        <DialogTitle>Registrar Venta</DialogTitle>
        <Io5Icons.IoClose onClick={onClose} className='iconClosedModal' />
      </div>
      <DialogContent>
        <div className="contentModal">
          <TextField
            label="Nombre del Producto"
            value={product?.productName ?? ''}
            variant="outlined"
            color="success"
            disabled
          />
          <TextField
            label="Proveedor"
            value={providers.find(p => p.id === product?.provider_id)?.companyName ?? ''}

            variant="outlined"
            color="success"
            disabled
          />
          <TextField
            label="Precio Unitario"
            value={unitCost}
            variant="outlined"
            color="success"
            disabled
          />
          <TextField
            required
            type="number"
            label="Cantidad"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            variant="outlined"
            color="success"
          />
          <TextField
            required
            type="number"
            label="Costo Total"
            value={totalCost}
            variant="outlined"
            color="success"
            disabled
          />
          <TextField
            required
            type="date"
            label="Fecha de Entrada"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            variant="outlined"
            color="success"
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            label="Usuario Responsable"
            value={user ? user.name : ''}
            variant="outlined"
            color="success"
            disabled
          />
        </div>
      </DialogContent>
      <DialogActions>
        <button onClick={handleSubmit} className="btnRegisterModal">
          Registrar
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterSaleModal;