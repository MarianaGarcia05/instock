const express = require('express');
const router = express.Router();
const companyController = require ('../controllers/companyController');

//Obtener datos de la empresa
router.get('/', companyController.getCompany);

//actualizar datos
router.put('/', companyController.updateCompany);

module.exports = router;