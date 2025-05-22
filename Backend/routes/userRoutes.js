const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware'); 

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

router.get('/profile', verifyToken, userController.getUser);
router.put('/update/profile/:id', verifyToken, userController.updateUser);
// router.post('/forgot-password', userController.forgotPassword);

module.exports = router;