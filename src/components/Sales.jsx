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
import { toast, ToastContainer } from 'react-toastify'
import api from '../../Backend/config/api';
import { Table, TableBody, TableCell, Button, TableContainer, TableHead, TablePagination, TableRow, Paper, TextField } from '@mui/material';

const Sales = () => {
    const [page, setPage] = useState(0);
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState('');
    const [timer, setTimer] = useState(null);
    const [products, setProducts] = useState([]);
    const [providers, setProviders] = useState([]);
    const [users, setUsers] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(7);
    const [modalOpen, setModalOpen] = useState(false);
    const [FilteredSales, setFilteredSales] = useState([]);

    useEffect(() => {
        fetchSales();
        fetchProducts();
        fetchProviders();
        fetchUsers();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await api.get('/sales');
            setSales(response.data);
            setFilteredSales(response.data);
        } catch (error) {
            console.error('Error al obtener las ventas:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/product');
            const productsData = response.data.reduce((acc, product) => {
                acc[product.id] = product.productName;
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
            if (event.target.value && filteredSales.length === 0) {
                toast.error("No se encontraron Registros con ese criterio de busqueda.");
            }
        }, 500);
        setTimer(newTimer);
    };

    const filteredSales = sales.filter((sale) =>
        String(sale.productName).toLowerCase().includes(search.toLowerCase())
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
            { header: 'Fecha venta', key: 'fechaVenta', width: 15 },
            { header: 'Usuario', key: 'usuario', width: 15 },
        ];

        worksheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

        // Agregar datos con bordes
        filteredSales.forEach((s, i) => {
            const row = worksheet.addRow({
                index: i + 1, producto: products[s.product_id], proveedor: providers[s.provider_id], cantidad: s.amount, costoUnitario: s.unitCost, total: s.totalCost, fechaVenta: s.saleDate, usuario: users[s.user_id]
            });
            row.eachCell(cell => (cell.border = headerStyle.border));
        });

        // Generar y guardar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Ventas.xlsx');
    };
    return (
        <div className="salesContainer">
            <div className="tableContent">
                <div className="optionsDataSales">
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
                                <TableCell>Fecha venta</TableCell>
                                <TableCell>Usuario</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSales
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((sales, index) => {
                                    console.log('product_id de la entrada:', sales.product_id); // <-- Agrega esto
                                    return (
                                        <TableRow key={sales.id}>
                                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell>{products[sales.product_id]}</TableCell>
                                            <TableCell>{providers[sales.provider_id]}</TableCell>
                                            <TableCell>{sales.amount}</TableCell>
                                            <TableCell>${new Intl.NumberFormat('es-CO').format(sales.unitCost)}</TableCell>
                                            <TableCell>${new Intl.NumberFormat('es-CO').format(sales.totalCost)}</TableCell>
                                            <TableCell>
                                                {new Intl.DateTimeFormat('es-CO', { dateStyle: 'short' }).format(new Date(sales.saleDate))}
                                            </TableCell>
                                            <TableCell>{users[sales.user_id]}</TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredSales.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>

            <ToastContainer />
        </div>
    )
}

export default Sales
