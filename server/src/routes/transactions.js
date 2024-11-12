const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateJWT = require('../middlewares/authenticateJWT');

router.get('/summary', authenticateJWT, transactionController.getTransactionsSummary);

module.exports = router;

const upload = require('../middlewares/upload');
router.post('/upload', authenticateJWT, upload.single('slip'), (req, res) => {
    res.json({ message: 'File uploaded successfully', file: req.file });
});

router.post('/', authenticateJWT, badWordsFilter, transactionController.createTransaction);
