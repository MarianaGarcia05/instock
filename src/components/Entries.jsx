import '../App.css'
import axios from 'axios';
import '../styles/Table.css'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import * as FaIcons from 'react-icons/fa'
import * as MdIcons from 'react-icons/md'
import 'react-toastify/dist/ReactToastify.css'
import React, { useState, useEffect } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';
import EntriesModal from './modal/entriesModal';
import { toast, ToastContainer } from 'react-toastify'
import api from '../../Backend/config/api';
import { Table, TableBody, TableCell, Button, TableContainer, TableHead, TablePagination, TableRow, Paper, TextField } from '@mui/material';

const Entries = () => {
  const [page, setPage] = useState(0);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [timer, setTimer] = useState(null);
  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  // const [searchProduct, setSearchProduct] = useState('');
  // const [searchProvider, setSearchProvider] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEntries();
    fetchProducts();
    fetchProviders();
    fetchUsers();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/entries');
      setEntries(response.data);
      setFilteredEntries(response.data);
    } catch (error) {
      console.error('Error al obtener las entradas:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/product');
      const productsData = response.data.reduce((acc, product) => {
        acc[product.id] = {
          productName: product.productName,
          presentation: product.presentation
        };
        return acc;
      }, {});

      setProducts(productsData);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };



  const fetchProviders = async () => {
    try {
      const response = await api.get('/provider');
      const providersData = response.data.reduce((acc, provider) => {
        acc[provider.id] = provider.companyName;
        return acc;
      }, {});
      setProviders(providersData);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const usersData = response.data.reduce((acc, user) => {
        acc[user.id] = `${user.names} ${user.surnames}`;
        return acc;
      }, {});
      setUsers(usersData);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
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
      if (event.target.value && filteredEntries.length === 0) {
        toast.error("No se encontraron Registros con ese criterio de busqueda.");
      }
    }, 500);
    setTimer(newTimer);
  };

  const filteredEntries = entries.filter((entry) =>
    String(entry.productName).toLowerCase().includes(search.toLowerCase())
  );

  //Descargar la tabla en un archivo excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Entradas');

    // Definir columnas y estilos de encabezados
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '145A32' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };

    worksheet.columns = [
      { header: 'N°', key: 'index', width: 5 },
      { header: 'Producto', key: 'producto', width: 20 },
      { header: 'Proveedor', key: 'proveedor', width: 15 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
      { header: 'Costo unitario', key: 'costoUnitario', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Fecha entrada', key: 'fechaEntrada', width: 15 },
      { header: 'Usuario', key: 'usuario', width: 15 },
    ];

    worksheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

    // Agregar datos con bordes
    filteredEntries.forEach((e, i) => {
      const row = worksheet.addRow({ index: i + 1, producto: `${products[e.product_id]?.productName} - ${products[e.product_id]?.presentation}`, 
        proveedor: providers[e.provider_id], cantidad: e.quantity, costoUnitario: e.unitCost, total: e.totalCost, fechaEntrada: e.entryDate, 
        usuario: users[e.user_id]});
      row.eachCell(cell => (cell.border = headerStyle.border));
    });

    // Generar y guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Entradas.xlsx');
  };

  return (
    <div className="entriesContainer">
      <div className="tableContent">
        <div className="optionsData">
          <button className="btnRegister" onClick={() => setModalOpen(true)} >
            <FaIcons.FaPlus /> Registrar entrada
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
            label="Buscar registro"
            variant="standard"
            onChange={handleSearch}
            placeholder="Buscar por producto"
          />
        </div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N°</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Costo unitario</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Fecha entrada</TableCell>
                <TableCell>Usuario</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((entries, index) => {
                  console.log('product_id de la entrada:', entries.product_id); // <-- Agrega esto
                  return (
                    <TableRow key={entries.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        {products[entries.product_id]?.productName} - ({products[entries.product_id]?.presentation})
                      </TableCell>
                      <TableCell>{providers[entries.provider_id]}</TableCell>
                      <TableCell>{entries.quantity}</TableCell>
                      <TableCell>${new Intl.NumberFormat('es-CO').format(entries.unitCost)}</TableCell>
                      <TableCell>${new Intl.NumberFormat('es-CO').format(entries.totalCost)}</TableCell>
                      <TableCell>
                        {new Intl.DateTimeFormat('es-CO', { dateStyle: 'short' }).format(new Date(entries.entryDate))}
                      </TableCell>
                      <TableCell>{users[entries.user_id]}</TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredEntries.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>

      <EntriesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fetchEntries={fetchEntries} />
      <ToastContainer />
    </div>
  );
};

export default Entries;
