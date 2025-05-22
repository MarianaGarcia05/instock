import '../App.css'
import axios from 'axios'
import '../styles/Table.css'
import Swal from 'sweetalert2'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import UserModal from './modal/userModal'
import * as FaIcons from 'react-icons/fa'
import * as MdIcons from 'react-icons/md'
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Paper, TextField } from '@mui/material';

const User = () => {
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [timer, setTimer] = useState(null);
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/roles');
      const rolesData = response.data.reduce((acc, role) => {
        acc[role.id] = role.rol; // Mapea ID a nombre del rol
        return acc;
      }, {});
      setRoles(rolesData);
    } catch (error) {
      console.error('Error al obtener los roles', error);
    }
  };

  const fetchUsers = () => {
    axios.get('http://localhost:3000/api/users')
      .then((response) => setUsers(response.data))
      .catch((error) => console.error('Error al obtener los usuarios', error));
  }

  // Maneja el cambio de página
  const handleChangePage = (event, newPage) => setPage(newPage);

  // Maneja el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(10);
  };

  // Manejo de buscador
  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);

    // Limitar las notificaciones con un debounce
    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      // Mostrar notificación solo si no hay resultados y la búsqueda no está vacía
      if (event.target.value && filteredUsers.length === 0) {
        toast.error("No se encontraron usuarios con ese criterio de búsqueda.");
      }
    }, 500); // Retraso de 500 ms

    setTimer(newTimer);
  };

  //Filtar usuarios con la busqueda
  const filteredUsers = users.filter((user) =>
    String(user.names).toLowerCase().includes(search.toLowerCase()) ||
    String(user.surnames).toLowerCase().includes(search.toLowerCase()) ||
    String(user.documentNumber).toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setOpenModal(true);
  }

  const handleDelete = (userId) => {
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
        axios.delete(`http://localhost:3000/api/users/${userId}`)
          .then(() => {
            toast.success('Usuario eliminado éxitosamente');
            fetchUsers();
          })
          .catch((error) => {
            console.error('Error al eliminar el usuario:', error);
            toast.error('Error al eliminar el usuario.');
          });
      }
    })
  };

  //Descargar la tabla en un archivo excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');

    // Definir columnas y estilos de encabezados
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '145A32' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };

    worksheet.columns = [
      { header: 'N°', key: 'index', width: 5 },
      { header: 'Tipo de documento', key: 'tipoDocumento', width: 20 },
      { header: 'Número de documento', key: 'numeroDocumento', width: 20 },
      { header: 'Avatar', key: 'avatar', width: 20 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Correo', key: 'correo', width: 20 },
      { header: 'Contraseña', key: 'contraseña', width: 20 },
      { header: 'Rol', key: 'rol', width: 20 },
      { header: 'Estado', key: 'estado', width: 15 }
    ];

    worksheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

    // Agregar datos con bordes
    filteredUsers.forEach((u, i) => {
      const row = worksheet.addRow({ index: i + 1, tipoDocumento: u.documentType, numeroDocumento: u.documentNumber, avatar: u.avatar, nombre: u.names, apellido: u.surnames, correo: u.email, contraseña: u.password, rol: roles[u.role_id] || "Desconocido", estado: u.status === "active" ? "Activo" : "Inactivo" });
      row.eachCell(cell => (cell.border = headerStyle.border));
    });

    // Generar y guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Usuarios.xlsx');
  };

  return (
    <div className="tableContent">
      <div className="optionsData">
        <button className='btnRegister' onClick={() => handleOpenModal('create')}>
          <FaIcons.FaPlus /> Registrar usuario
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
          label='Buscar usuarios'
          onChange={handleSearch}
          placeholder='Buscar por nombre, apellido o N° de documento'
        />
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Avatar</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo electrónico</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{user.documentType} - {user.documentNumber}</TableCell>
                  <TableCell><img
                    src={user.avatar}
                    alt="Avatar"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  /></TableCell>
                  <TableCell>{user.names} {user.surnames}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{roles[user.role_id] || 'Desconocido'}</TableCell>
                  <TableCell>{user.status === "active" ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>
                    <FaIcons.FaUserEdit
                      className='actionIcon'
                      onClick={() => handleOpenModal('edit', user)}
                    />
                    <MdIcons.MdDeleteForever
                      id='deleteIcon'
                      className='actionIcon'
                      onClick={() => handleDelete(user.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredUsers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <UserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        fetchUsers={fetchUsers}
        mode={modalMode}
        userData={selectedUser}
      />
      <ToastContainer />
    </div>
  );
}

export default User;
