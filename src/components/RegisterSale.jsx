import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Pagination,
  Autocomplete,
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Table.css';
import * as FaIcons from 'react-icons/fa';
import api from '../../Backend/config/api';
import SaleModal from '../components/modal/registerSaleModal';

const RegisterSale = ({ userId }) => {
  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const rowsPerPage = 6;
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sales, setSales] = useState([]);

  // Obtener productos con stock
  const fetchProducts = async () => {
    try {
      const response = await api.get('/product/withStock');
      setProducts(response.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  // Obtener proveedores
  const fetchProviders = async () => {
    try {
      const response = await api.get('/provider');
      const providerMap = {};
      response.data.forEach((p) => {
        providerMap[p.id] = p.companyName;
      });
      setProviders(providerMap);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
    }
  };

  // Obtener ventas (si es necesario)
  const fetchSales = async () => {
    try {
      const response = await api.get('/sales');
      setSales(response.data);
    } catch (error) {
      console.error('Error al obtener las ventas:', error);
    }
  };

  // Obtener categorías
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchProviders();
    fetchCategories();
  }, []);

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = products.filter((p) =>
    (p.productName.toLowerCase().includes(search.toLowerCase()) ||
      (providers[p.provider_id]?.toLowerCase() ?? '').includes(search.toLowerCase())) &&
    (selectedCategory === '' || p.category === selectedCategory)
  );

  // Productos que se muestran en la página actual
  const currentProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Manejar clic en producto para abrir modal
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <div className='salesContainer'>
      <div className="optionsSale" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="buscadorSales" style={{ flex: 1, minWidth: 250 }}>
          <TextField
            label="Buscar por producto o marca"
            variant="standard"
            color="success"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <FaIcons.FaSearch style={{ marginRight: 8, color: 'gray' }} />
              ),
            }}
          />
        </div>

        {/* Autocomplete para categorías */}
        <Autocomplete
          options={categories.map(cat => cat.category)}
          value={selectedCategory}
          onChange={(event, newValue) => setSelectedCategory(newValue || '')}
          freeSolo
          clearOnEscape
          renderInput={(params) => (
            <TextField
              {...params}
              label="Categoría"
              variant="filled"
              color="success"
              className="categoriaSelect"
            />
          )}
          style={{ minWidth: 200 }}
        />
      </div>

      <Grid container spacing={2} style={{ marginTop: 16 }}>
        {currentProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              onClick={() => product.stock > 0 && handleProductClick(product)}
              style={{
                cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                opacity: product.stock > 0 ? 1 : 0.5
              }}
            >
              <img
                src={product.image}
                alt={product.productName}
                style={{
                  width: '100%',
                  height: 150,
                  objectFit: 'contain',
                  margin: 'auto',
                  marginTop: 2
                }}
              />
              <CardContent>
                <Typography variant="h6">{product.productName} - {providers[product.provider_id]}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Precio: ${product.salePrice}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Stock: {product.stock}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Presentación: {product.presentation}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Pagination
        count={Math.ceil(filteredProducts.length / rowsPerPage)}
        page={page}
        onChange={(_, value) => setPage(value)}
        style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}
      />

      <SaleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        userId={userId}
        fetchSales={fetchSales}
      />
      <ToastContainer />
    </div>
  );
};

export default RegisterSale;
