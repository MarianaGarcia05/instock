import '../App.css'
import axios from 'axios'
import '../styles/Table.css'
import Swal from 'sweetalert2'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import * as FaIcons from 'react-icons/fa'
import * as MdIcons from 'react-icons/md'
import 'react-toastify/dist/ReactToastify.css'
import CategoryModal from './modal/categoryModal'
import React, { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import api from '../../Backend/config/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Paper, TextField } from '@mui/material';

const Categories = () => {
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [timer, setTimer] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [selectedCategories, setSelectedCategories] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    api.get('/categories')
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Error al obtener las categorias:', error));
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
      if (event.target.value && filteredCategories.length === 0) {
        toast.error("No se encontraron categorias con ese criterio de busqueda.");
      }
    }, 500);
    setTimer(newTimer);
  };

  const filteredCategories = categories.filter((categories) =>
    String(categories.Category).toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (mode, Category = null) => {
    setModalMode(mode);
    setSelectedCategories(Category);
    setOpenModal(true);
  };

  const handleDelete = (categoriesId) => {
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
        api.delete(`/categories/${categoriesId}`)
          .then(() => {
            toast.success('Categoría eliminada con éxito');
            fetchCategories();
          })
          .catch((error) => {
            console.error('Error al eliminar la categoria:', error);
            toast.error('Error al eliminar la categoria.');
          });
      }
    })
  }

  //Descargar la tabla en un archivo excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Categorias');

    // Definir columnas y estilos de encabezados
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '145A32' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };

    worksheet.columns = [
      { header: 'N°', key: 'index', width: 5 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Estado', key: 'estado', width: 15 }
    ];

    worksheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

    // Agregar datos con bordes
    filteredCategories.forEach((c, i) => {
      const row = worksheet.addRow({ index: i + 1, categoria: c.category, estado: c.status === "active" ? "Activo" : "Inactivo" });
      row.eachCell(cell => (cell.border = headerStyle.border));
    });

    // Generar y guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Categorias.xlsx');
  };

  return (
    <div className="tableContent">
      <div className="optionsData">
        <button className="btnRegister" onClick={() => handleOpenModal('create')}>
          <FaIcons.FaPlus /> Registrar categoria
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
          label="Buscar categoría"
          variant="standard"
          onChange={handleSearch}
          placeholder="Buscar por categoria"
        />
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((categories, index) => (
                <TableRow key={categories.id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{categories.category}</TableCell>
                  <TableCell>{categories.status === "active" ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>
                    <FaIcons.FaEdit
                      className="actionIcon"
                      onClick={() => handleOpenModal('edit', categories)}
                    />
                    <MdIcons.MdDeleteForever
                      id='deleteIcon'
                      className="actionIcon"
                      onClick={() => handleDelete(categories.id)}
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
        count={filteredCategories.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <CategoryModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        fetchCategories={fetchCategories}
        mode={modalMode}
        categoriesData={selectedCategories}
      />
      <ToastContainer />
    </div>
  );
};

export default Categories;
