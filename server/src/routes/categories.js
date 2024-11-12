const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateJWT = require('../middlewares/authenticateJWT');

router.post('/', authenticateJWT, categoryController.createCategory);
router.delete('/:id', authenticateJWT, categoryController.deleteCategory);

module.exports = router;
