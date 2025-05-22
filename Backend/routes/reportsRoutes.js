const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

router.get('/entradas-vs-salidas', reportsController.getEntradasVsSalidas);
router.get('/top-productos-vendidos', reportsController.getTopProductosVendidos);
router.get('/cards-resumen', reportsController.getCardsResumen);
router.get('/export-excel', reportsController.exportExcel);
router.get('/categorias-mas-vendidas', reportsController.getCategoriasMasVendidas);


module.exports = router;
