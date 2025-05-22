import '../App.css'
import axios from 'axios'
import '../styles/Table.css'
import Swal from 'sweetalert2'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import RolModal from './modal/rolModal'
import * as FaIcons from 'react-icons/fa'
import * as MdIcons from 'react-icons/md'
import 'react-toastify/dist/ReactToastify.css'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Paper, TextField, Button } from '@mui/material';


const Rol = () => {
    const [page, setPage] = useState(0);
    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState('');
    const [timer, setTimer] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(7);
    const [selectedRole, setSelectedRole] = useState(null);
    const [modalMode, setModalMode] = useState('create');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = () => {
        axios.get('http://localhost:3000/api/roles')
            .then((response) => setRoles(response.data))
            .catch((error) => console.error('Error al obtener los roles:', error));
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
            if (event.target.value && filteredRoles.length === 0) {
                toast.error("No se encontraron roles con ese criterio de busqueda.");
            }
        }, 500);

        setTimer(newTimer);
    };

    const filteredRoles = roles.filter((role) =>
        String(role.rol).toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenModal = (mode, role = null) => {
        setModalMode(mode);
        setSelectedRole(role);
        setOpenModal(true);
    };

    const handleDelete = (roleId) => {
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
                axios.delete(`http://localhost:3000/api/roles/${roleId}`)
                    .then(() => {
                        toast.success('Rol eliminado con éxito');
                        fetchRoles();
                    })
                    .catch((error) => {
                        console.error('Error al eliminar el rol:', error);
                        toast.error('Error al eliminar el rol.');
                    });
            }
        })
    };

    //Descargar la tabla en un archivo excel
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Roles');
    
        // Definir columnas y estilos de encabezados
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '145A32' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        };
    
        worksheet.columns = [
            { header: 'N°', key: 'index', width: 5 },
            { header: 'Cargo', key: 'rol', width: 20 },
            { header: 'Estado', key: 'estado', width: 15 }
        ];
    
        worksheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
    
        // Agregar datos con bordes
        filteredRoles.forEach((r, i) => {
            const row = worksheet.addRow({ index: i + 1, rol: r.rol, estado: r.status === "active" ? "Activo" : "Inactivo" });
            row.eachCell(cell => (cell.border = headerStyle.border));
        });
    
        // Generar y guardar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Roles.xlsx');
    };
    

    return (
        <div className="tableContent">
            <div className="optionsData">
                <button className='btnRegister' onClick={() => handleOpenModal('create')}>
                    <FaIcons.FaPlus /> Registrar rol
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
                    label="Buscar rol"
                    variant="standard"
                    onChange={handleSearch}
                />
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>N°</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRoles
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((role, index) => (
                                <TableRow key={role.id}>
                                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                    <TableCell>{role.rol}</TableCell>
                                    <TableCell>{role.status === "active" ? 'Activo' : 'Inactivo'}</TableCell>
                                    <TableCell>
                                        <FaIcons.FaEdit
                                            className="actionIcon"
                                            onClick={() => handleOpenModal('edit', role)}
                                        />
                                        <MdIcons.MdDeleteForever
                                            id='deleteIcon'
                                            className="actionIcon"
                                            onClick={() => handleDelete(role.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={filteredRoles.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <RolModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                fetchRoles={fetchRoles}
                mode={modalMode}
                roleData={selectedRole}
            />
            <ToastContainer />
        </div>
    );
};

export default Rol;
