import '../../App.css';
import axios from 'axios';
import '../../styles/Modal.css';
import { toast } from 'react-toastify';
import * as Io5Icons from 'react-icons/io5';
import React, { useState, useEffect } from 'react';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import api from '../../../Backend/config/api';

const EntriesModal = ({ open, onClose, fetchEntries }) => {
  const [product, setProduct] = useState(null);
  const [provider, setProvider] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [user, setUser] = useState('');
  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [productsRes, providersRes] = await Promise.all([
            api.get('/product'),
            api.get('/provider'),

          ]);

          setProducts(productsRes.data);
          setProviders(providersRes.data);

          const loggedUser = JSON.parse(localStorage.getItem('user'));
          if (loggedUser) {
            setUser({ id: loggedUser.id, name: `${loggedUser.names} ${loggedUser.surnames}` });
          }

          const today = new Date().toISOString().split('T')[0];
          setEntryDate(today);

        } catch (error) {
          console.error('Error al cargar datos:', error);
        }
      };
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (quantity && unitCost) {
      setTotalCost(quantity * unitCost);
    } else {
      setTotalCost('');
    }
  }, [quantity, unitCost]);

  const handleSubmit = async () => {
    if (!product || !provider || !quantity || !unitCost || !entryDate || !user) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    try {
      await api.post('/entries', {
        product_id: product.id,
        provider_id: provider.id,
        quantity,
        unitCost,
        totalCost,
        entryDate,
        expirationDate,
        user_id: user.id
      });
      toast.success('Entrada registrada exitosamente');
      fetchEntries();
      onClose();
    } catch (error) {
      console.error('Error al registrar la entrada:', error);
      toast.error('Error al registrar la entrada');
    }
  };

  useEffect(() => {
    if (!open) {
      setProduct(null);
      setProvider(null);
      setQuantity('');
      setUnitCost('');
      setTotalCost('');
      setExpirationDate('');
    }
  }, [open]);


  return (
    <Dialog open={open} onClose={onClose}>
      <div className="modalHeader">
        <DialogTitle>Registrar Entrada</DialogTitle>
        <Io5Icons.IoClose onClick={onClose} className='iconClosedModal' />
      </div>
      <DialogContent>
        <div className="contentModal">
          {/* Producto */}
          <Autocomplete
            options={products}
            getOptionLabel={(option) => `${option.productName} (${option.presentation})`}
            value={product}
            onChange={(event, newValue) => setProduct(newValue)}
            renderOption={(props, option) => (
              <li {...props} key={`${option.id}-${option.provider_id}`}>
                {option.productName} ({option.presentation})
              </li>
            )}
            renderInput={(params) => <TextField {...params} label="Producto" variant="outlined" color="success" required />}
          />

          {/* Proveedor */}
          <Autocomplete
            options={providers}
            getOptionLabel={(option) => option.companyName}
            value={provider}
            onChange={(event, newValue) => setProvider(newValue)}
            renderInput={(params) => <TextField {...params} label="Marca" variant="outlined" color="success" required />}
          />

          <TextField
            required
            type="number"
            label="Cantidad"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            variant="outlined"
            color="success"
          />

          <TextField
            required
            type="number"
            label="Costo Unitario"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
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
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            variant="outlined"
            color="success"
            InputLabelProps={{ shrink: true }}
            disabled
          />

          {/* <TextField
            type="date"
            label="Fecha de Expiración"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            variant="outlined"
            color="success"
            InputLabelProps={{ shrink: true }}
          /> */}

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

export default EntriesModal;
