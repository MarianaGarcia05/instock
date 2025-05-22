import axios from 'axios'
import '../styles/Table.css'
import Swal from 'sweetalert2'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import * as FaIcons from 'react-icons/fa'
import * as MdIcons from 'react-icons/md'
import ProductModal from './modal/productModal'
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import api from '../../Backend/config/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Paper, TextField } from '@mui/material';


const Product = () => {
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState([]);
  const [timer, setTimer] = useState(null);
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [provider, setProvider] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchProvider();
    fetchCategories();
  }, []);

  const fetchProvider = async () => {
    try {
      const response = await api.get('/provider');
      const providerData = response.data.reduce((acc, provider) => {
        acc[provider.id] = provider.companyName;
        return acc;
      }, {});
      setProvider(providerData);
    } catch (error) {
      console.error('Error al obtener las empresas', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const categoriesData = response.data.reduce((acc, category) => {
        acc[category.id] = category.category;
        return acc;
      }, {});
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al obtener las categorias', error);
    }
  };

  const fetchProducts = () => {
    api.get('/product')
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Error al obtener los productos:', error));
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);

    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      if (event.target.value && filteredProducts.length === 0) {
        toast.error("No se encontraron productos con ese criterio de busqueda.");
      }
    }, 500);
    setTimer(newTimer);
  };

  const filteredProducts = products.filter((products) =>
    String(products.productName).toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (mode, Product = null) => {
    setModalMode(mode);
    setSelectedProducts(Product);
    setOpenModal(true);
  };

  const handleDelete = (productsId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00891B',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((results) => {
      if (results.isConfirmed) {
        api.delete(`/product/${productsId}`)
          .then(() => {
            toast.success('Producto eliminada con éxito');
            fetchProducts();
          })
          .catch((error) => {
            console.error('Error al eliminar la producto:', error);
            toast.error('Error al eliminar la producto.');
          });
      }
    })
  }

  // Descargar la tabla en un archivo excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos');

    // Definir columnas y estilos de encabezados
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '145A32' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };

    worksheet.columns = [
      { header: 'N°', key: 'index', width: 5 },
      { header: 'Producto', key: 'nombreProducto', width: 20 },
      { header: 'Precio de venta', key: 'precioVenta', width: 20 },
      { header: 'Presentación', key: 'presentacion', width: 20 },
      { header: 'Marca', key: 'proveedor', width: 20 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Estado', key: 'estado', width: 15 }
    ];

    worksheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

    // Agregar datos con bordes
    filteredProducts.forEach((p, i) => {
      const row = worksheet.addRow({ index: i + 1, nombreProducto: p.productName, precioVenta: p.salePrice, presentacion: p.presentation, proveedor: provider[p.provider_id], categoria: categories[p.category_id], estado: p.status === "active" ? "Activo" : "Inactivo" });
      row.eachCell(cell => (cell.border = headerStyle.border));
    });

    // Generar y guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Productos.xlsx');
  };

  return (
    <div className="tableContent">
      <div className="optionsData">
        <button className="btnRegister" onClick={() => handleOpenModal('create')}>
          <FaIcons.FaPlus /> Registrar Producto
        </button>
        <button
          className='btnDownload'
        onClick={exportToExcel}
        >
          <FaIcons.FaFileDownload />
        </button>
        <TextField
          fullWidth
          value={search}
          color='success'
          label="Buscar Producto"
          variant="standard"
          onChange={handleSearch}
          placeholder="Buscar por nombre del producto"
        />
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Nombre Producto</TableCell>
              <TableCell>Precio de venta</TableCell>
              <TableCell>Presentación</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Imagen</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((Product, index) => (
                <TableRow key={Product.id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{Product.productName}</TableCell>
                  <TableCell>{Product.salePrice}</TableCell>
                  <TableCell>{Product.presentation}</TableCell>
                  <TableCell>{provider[Product.provider_id] || 'Desconocido'}</TableCell>
                  <TableCell>{categories[Product.category_id] || 'Desconocido'}</TableCell>
                  <TableCell>
                    <img
                      src={Product.image}
                      alt="Imagen del producto"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  </TableCell>

                  <TableCell>{Product.status === "active" ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>
                    <FaIcons.FaEdit
                      className='actionIcon'
                      onClick={() => handleOpenModal('edit', Product)}
                    />
                    <MdIcons.MdDeleteForever
                      id='deleteIcon'
                      className='actionIcon'
                      onClick={() => handleDelete(Product.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <ProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        fetchProducts={fetchProducts}
        mode={modalMode}
        productsData={selectedProducts}
      />
      <ToastContainer />
    </div>
  )
}

export default Product
