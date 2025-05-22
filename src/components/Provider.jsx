import '../App.css'
import axios from 'axios'
import '../styles/Table.css'
import Swal from 'sweetalert2'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import * as FaIcons from 'react-icons/fa'
import * as MdIcons from 'react-icons/md'
import ProviderModal from './modal/providerModal'
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react'
import api from '../../Backend/config/api';
import { toast, ToastContainer } from 'react-toastify';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Paper, TextField } from '@mui/material';

const Provider = () => {
    const [page, setPage] = useState(0);
    const [provider, setProvider] = useState([]);
    const [timer, setTimer] = useState(null);
    const [search, setSearch] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProvider, setSelectedProvider] = useState(null);

    useEffect(() => {
        fetchProvider();
    }, []);

    const fetchProvider = () => {
        api.get('/provider')
            .then((response) => setProvider(response.data))
            .catch((error) => console.error('Error al obtener los Proveedores', error));
    }

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(10);
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
        setPage(0);

        // Limitar las notificaciones con un debounce
        if (timer) {
            clearTimeout(timer);
        }

        const newTimer = setTimeout(() => {
            if (event.target.value && filteredProvider.length === 0) {
                toast.error("No se encontraron proveedores con ese criterio de búsqueda.");
            }
        }, 500); // Retraso de 500 ms

        setTimer(newTimer);
    };

    //Filtar la busqueda
    const filteredProvider = provider.filter((provider) =>
        String(provider.documentNumber).toLowerCase().includes(search.toLowerCase()) ||
        String(provider.companyName).toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenModal = (mode, provider = null) => {
        setModalMode(mode);
        setSelectedProvider(provider);
        setOpenModal(true);
    }

    const handleDelete = (providerId) => {
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
                api.delete(`/provider/${providerId}`)
                    .then(() => {
                        toast.success('Proveedor eliminado éxitosamente');
                        fetchProvider();
                    })
                    .catch((error) => {
                        console.error('Error al eliminar el proveedor:', error);
                        toast.error('Error al eliminar el proveedor.');
                    });
            }
        })
    };

    //Descargar la tabla en un archivo excel
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Proveedores');

        // Definir columnas y estilos de encabezados
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '145A32' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        };

        worksheet.columns = [
            { header: 'N°', key: 'index', width: 5 },
            { header: 'Marca', key: 'nombreEmpresa', width: 20 },
            { header: 'Vendedor', key: 'proveedor', width: 20 },
            { header: 'Teléfono', key: 'telefono', width: 20 },
            { header: 'Estado', key: 'estado', width: 15 }
        ];

        worksheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

        // Agregar datos con bordes
        filteredProvider.forEach((p, i) => {
            const row = worksheet.addRow({ index: i + 1, nombreEmpresa: p.companyName, proveedor: p.supplier, telefono: p.phone, estado: p.status === "active" ? "Activo" : "Inactivo" });
            row.eachCell(cell => (cell.border = headerStyle.border));
        });

        // Generar y guardar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Proveedores.xlsx');
    };

    return (
        <div className="tableContent">
            <div className="optionsData">
                <button className="btnRegister" onClick={() => handleOpenModal('create')}>
                    <FaIcons.FaPlus />  Registrar vendedor
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
                    variant='standard'
                    label='Buscar marca'
                    onChange={handleSearch}
                    placeholder='Buscar por N° de documento o marca'
                />
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>N°</TableCell>
                            <TableCell>Marca</TableCell>
                            <TableCell>Vendedor</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProvider
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((provider, index) => (
                                <TableRow key={provider.id}>
                                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                    <TableCell>{provider.companyName}</TableCell>
                                    <TableCell>{provider.supplier}</TableCell>
                                    <TableCell>{provider.phone}</TableCell>
                                    <TableCell>{provider.status === "active" ? 'Activo' : 'Inactivo'}</TableCell>
                                    <TableCell>
                                        <FaIcons.FaEdit
                                            className='actionIcon'
                                            onClick={() => handleOpenModal('edit', provider)}
                                        />
                                        <MdIcons.MdDeleteForever
                                            id='deleteIcon'
                                            className='actionIcon'
                                            onClick={() => handleDelete(provider.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={filteredProvider.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <ProviderModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                fetchProvider={fetchProvider}
                mode={modalMode}
                providerData={selectedProvider}
            />
            <ToastContainer />
        </div>
    )
}

export default Provider
