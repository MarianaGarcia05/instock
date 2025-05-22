import '../App.css'
import axios from 'axios';
import * as FaIcons from 'react-icons/fa'
import '../styles/CompanyInformation.css'
import * as Hi2Icons from 'react-icons/hi2'
import { TextField, MenuItem } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import React, { useState, useEffect } from 'react';

const CompanyInformation = () => {
  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    axios.get('http://localhost:3000/api/company')
      .then((response) => {
        setFormData(response.data || {});
      })
      .catch((error) => {
        console.error('Error al obtener los datos de la empresa:', error);
      });
  }, []);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value || '' });
  };

  const handleUpdate = () => {
    axios.put('http://localhost:3000/api/company', formData)
      .then(() => {
        toast.success('Información actualizada correctamente');
      })
      .catch((error) => {
        console.error('Error al actualizar los datos de la empresa:', error);
        toast.error('Error al actualizar los datos de la empresa.');
      });
  };

  return (
    <div className="companyContent">
      <div className="companyInformationContent">
        <h1 className="title">
          <Hi2Icons.HiBuildingStorefront /> Información de la empresa
        </h1>
      </div>
      <div className="dataCompany">
        <div className='titleDataCompany'>
          <h4><FaIcons.FaEnvelopeOpenText /> En esta sección puede registrar los datos de su negocio.</h4>
        </div>
        <form action="" className='formDataCompany'>
          <TextField
            select
            required
            color='success'
            variant="standard"
            name="documentType"
            label="Tipo documento"
            onChange={handleChange}
            value={formData.documentType || ''}
          >
            <MenuItem value="DNI">DNI</MenuItem>
            <MenuItem value="CC">CC</MenuItem>
            <MenuItem value="NIT">NIT</MenuItem>
            <MenuItem value="RUC">RUC</MenuItem>
          </TextField>

          <TextField
            required
            type='number'
            color='success'
            variant="standard"
            name='documentNumber'
            onChange={handleChange}
            label="N° de documento"
            value={formData.documentNumber || ''}

          />

          <TextField
            required
            name='name'
            label="Nombre"
            color='success'
            variant="standard"
            value={formData.name || ''}
            onChange={handleChange}
          />

          <TextField
            required
            name="address"
            label="Dirección"
            color="success"
            variant="standard"
            onChange={handleChange}
            value={formData.address || ''}
          />
          <TextField
            label="Teléfono"
            variant="standard"
            color="success"
            name="phone"
            value={formData.phone}
            onChange={(e) => {
              const formattedPhone = e.target.value.replace(/\D/g, ''); // Remueve caracteres no numéricos
              setFormData({
                ...formData,
                phone: formattedPhone.slice(0, 10), // Limita el número a 10 dígitos
              });
            }}
          />

          <TextField
            required
            name='email'
            label="Correo"
            color='success'
            variant="standard"
            value={formData.email || ''}
            onChange={handleChange}
          />
        </form>
        <button className='btnCompany' onClick={handleUpdate}>Actualizar</button>
      </div>
      <ToastContainer />
    </div>
  )
}

export default CompanyInformation
