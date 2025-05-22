const express = require('express');
const router = express.Router();
const { getCounts } = require ('../controllers/cardCountController');

//obtener los conteos
router.get('/counts', getCounts);

module.exports = router;