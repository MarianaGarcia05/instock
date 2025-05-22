import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import '../styles/Table.css'
import * as FaIcons from 'react-icons/fa'
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Paper, TextField } from '@mui/material';

const Stock = () => {
  const [page, setPage] = useState(0);
  const [stockItems, setStockItems] = useState([]);
  const [search, setSearch] = useState('');
  const [timer, setTimer] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = () => {
    axios.get('http://localhost:3000/api/stock')
      .then(response => setStockItems(response.data))
      .catch(error => {
        console.error('Error al obtener el stock:', error);
        toast.error('Error al obtener el stock');
      });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);

    if (timer) clearTimeout(timer);

    const newTimer = setTimeout(() => {
      if (event.target.value && filteredStock.length === 0) {
        toast.error("No se encontraron resultados con ese criterio.");
      }
    }, 500);
    setTimer(newTimer);
  };

  const filteredStock = stockItems.filter(item =>
    String(item.product_id).toLowerCase().includes(search.toLowerCase()) ||
    String(item.provider_id).toLowerCase().includes(search.toLowerCase())
  );

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock');

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '145A32' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };

    worksheet.columns = [
      { header: 'N°', key: 'index', width: 5 },
      { header: 'Producto', key: 'product_id', width: 15 },
      { header: 'Proveedor', key: 'provider_id', width: 15 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Última actualización', key: 'lastUpdated', width: 25 }
    ];

    worksheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

    filteredStock.forEach((s, i) => {
      const row = worksheet.addRow({
        index: i + 1,
        product_id: `${s.productName} - (${s.presentation})`,
        provider_id: s.companyName || 'Desconocida',
        stock: s.stock,
        lastUpdated: s.lastUpdated
      });
      row.eachCell(cell => (cell.border = headerStyle.border));
    });


    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Stock.xlsx');
  };

  return (
    <div className="tableContent">
      <div className="optionsData2">
        <button className="btnDownload" onClick={exportToExcel}>
          <FaIcons.FaFileDownload />
        </button>
        <TextField
          fullWidth
          value={search}
          label="Buscar por producto o proveedor"
          variant="standard"
          onChange={handleSearch}
          placeholder="Buscar stock"
          color="success"
        />
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Cantidad disponible</TableCell>
              <TableCell>Última actualización</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStock
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item, index) => (
                <TableRow
                  key={`${item.product_id}-${item.provider_id}`}
                  sx={{
                    backgroundColor: item.stock <= 5 ? '#666666' : 'inherit',
                    color: item.stock <= 5 ? 'white' : 'inherit',
                    '& td': { color: item.stock <= 5 ? 'white' : 'inherit' }
                  }}
                >

                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{`${item.productName} - (${item.presentation})`}</TableCell>
                  <TableCell>{item.companyName}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>
                    {new Date(item.lastUpdated).toLocaleDateString('es-ES')} {' '} -
                    {new Date(item.lastUpdated).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </TableCell>

                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredStock.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <ToastContainer />
    </div>
  );
};

export default Stock;
