import '../../App.css'
import axios from 'axios'
import '../../styles/Modal.css'
import { toast } from 'react-toastify'
import Autocomplete from '@mui/material/Autocomplete';
import * as Io5Icons from 'react-icons/io5'
import React, { useState, useEffect } from 'react'
import { ArrowUpward } from '@mui/icons-material'
import defaultProductImage from '../../assets/imgDefecto.png';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Button, Avatar } from '@mui/material';

const presentations = [
  "Unidad", "Libra", "Kilogramo", "Caja", "Paquete", "Lata", "Galon", "Botella",
  "Sobre", "Bolsa", "1.5L", "3L", "400ML", "1L", "2L", "X4", "X5", "X6", "X12",
  "100G", "225G", "450G", "Otro"
];

const ProductModal = ({ open, onClose, fetchProducts, mode, productsData }) => {
  const [barCode, setBarCode] = useState('');
  const [productName, setProductName] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [presentation, setPresentation] = useState('');
  const [expiration, setExpiration] = useState('');
  const [provider_id, setProvider_id] = useState('');
  const [provider, setProvider] = useState([]);
  const [category_id, setCategory_id] = useState('');
  const [category, setCategory] = useState([]);
  const [status, setStatus] = useState('');

  const [image, setImage] = useState(defaultProductImage);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        console.log("Base64:", reader.result);
        setImage(reader.result);
      };
    }
  };

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/provider');
        setProvider(data);
      } catch (error) {
        console.error('Error al obtener la empresa:', error);
      }
    };
    fetchProvider();
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/categories');
        setCategory(data);
      } catch (error) {
        console.error('Error al obtener la categoría:', error);
      }
    };
    fetchCategory();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && productsData) {
      setBarCode(productsData.barCode);
      setProductName(productsData.productName);
      setSalePrice(productsData.salePrice);
      setPresentation(productsData.presentation);
      setExpiration(productsData.expiration);
      setProvider_id(productsData.provider_id);
      setCategory_id(productsData.category_id);
      setStatus(productsData.status);
      setImage(productsData.image);
      setImagePreview(productsData.imagePreview);
    }
  }, [mode, productsData]);



  const handleSubmit = async () => {
    try {

      if (mode === 'create') {
        await axios.post('http://localhost:3000/api/product', {
          barCode,
          productName,
          salePrice,
          presentation,
          expiration,
          provider_id,
          category_id,
          status,
          image,
          imagePreview
        });
        toast.success('Producto creado exitosamente');
      } else if (mode === 'edit') {
        await axios.put(`http://localhost:3000/api/product/${productsData.id}`, {
          barCode,
          productName,
          salePrice,
          presentation,
          expiration,
          provider_id,
          category_id,
          status,
          image,
          imagePreview
        });
        toast.success('Producto editado exitosamente');
      }

      fetchProducts();
      onClose();
    } catch (error) {
      console.error('Error al procesar el producto:', error);
      toast.error('Error al procesar el producto');
    }
  };


  useEffect(() => {
    if (!open) {
      setBarCode('');
      setProductName('');
      setSalePrice('');
      setPresentation('');
      setExpiration('');
      setProvider_id('');
      setCategory_id('');
      setStatus('');
      setImage(defaultProductImage);
      setImagePreview('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="modalHeader">
        <DialogTitle>{mode === 'create' ? 'Registrar Producto' : 'Editar Producto'}</DialogTitle>
        <Io5Icons.IoClose onClick={onClose} className="iconClosedModal" />
      </div>
      <DialogContent>
        <div className="contentModal">
          {/* <TextField
            name='barCode'
            label="Código de barras"
            value={barCode}
            variant="outlined"
            color="success"
            onChange={(e) => setBarCode(e.target.value)}
          /> */}

          <TextField
            required
            name="productName"
            label="Producto"
            value={productName}
            color="success"
            variant="outlined"
            onChange={(e) => setProductName(e.target.value)}
          />

          <TextField
            required
            name="salePrice"
            label="Precio"
            value={salePrice}
            color="success"
            type='number'
            variant="outlined"
            onChange={(e) => setSalePrice(e.target.value)}
          />

          <Autocomplete
            options={presentations}
            value={presentation}
            onChange={(event, newValue) => {
              setPresentation(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Presentación"
                variant="outlined"
                required
                color="success"
              />
            )}
            freeSolo={false} // si quieres que solo se pueda elegir de la lista
            disableClearable={true} // para que siempre haya un valor seleccionado (opcional)
          />

          <Autocomplete
            options={provider}
            getOptionLabel={(option) => option.companyName || ""}
            value={provider.find(p => p.id === provider_id) || null}
            onChange={(event, newValue) => {
              setProvider_id(newValue ? newValue.id : null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Marca"
                variant="outlined"
                required
                color="success"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          <Autocomplete
            options={category}
            getOptionLabel={(option) => option.category || ""}
            value={category.find(c => c.id === category_id) || null}
            onChange={(event, newValue) => {
              setCategory_id(newValue ? newValue.id : null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categoría"
                variant="outlined"
                required
                color="success"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

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

          <>
            <input
              accept="image/*"
              id="upload-image"
              type="file"
              style={{ display: "none" }}
              onChange={handleImageChange}

            />
            <label htmlFor="upload-image">
              <Button variant="contained" component="span" startIcon={<ArrowUpward />}
                sx={{ backgroundColor: "#145A32", "&:hover": { backgroundColor: "#388E3C" }, width: "200px", height: "56px" }}>
                Subir Imagen
              </Button>
            </label>
          </>
          {image && (
            <div style={{ marginTop: "10px" }}>
              <Avatar
                src={imagePreview || image}
                alt="Imagen subida"
                sx={{ width: 100, height: 100, margin: "auto" }}
              />
            </div>
          )}
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

export default ProductModal
