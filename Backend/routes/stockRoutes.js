const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/:productId/:providerId', stockController.getStock);
router.get('/', stockController.getAllStock);

module.exports = router;