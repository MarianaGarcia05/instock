const express = require ('express');
const router = express.Router();
const categoriesController = require('../controllers/categoryController');

router.get('/', categoriesController.getAllCategories);
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategories);
router.delete('/:id', categoriesController.deleteCategories);

module.exports = router;