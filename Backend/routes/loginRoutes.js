const express = require('express');
const router = express.Router();
const loginController = require ('../controllers/loginControllers');

//ruta login
router.post('/', loginController.login);

module.exports = router;