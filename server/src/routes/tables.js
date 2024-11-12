const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const authenticateJWT = require('../middlewares/authenticateJWT');

// Route สำหรับสร้าง Table ใหม่
router.post('/', authenticateJWT, tableController.createTable);

module.exports = router;
