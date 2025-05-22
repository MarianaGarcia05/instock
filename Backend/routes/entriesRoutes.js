const express = require('express');
const router = express.Router();
const entriesController = require('../controllers/entriesController');
const stockController = require('../controllers/stockController');


router.get('/', entriesController.getAllEntries);
router.post('/', entriesController.createEntry);
router.delete('/:id', entriesController.deleteEntry);
router.get('/stock/:productId/:providerId', stockController.getStock);

module.exports = router;
