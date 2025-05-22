const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const stockController = require('../controllers/stockController');

router.get('/', salesController.getAllSales);
router.post('/', salesController.createSale);
router.get('/stock/:productId/:providerId', stockController.getStock);

module.exports = router;
