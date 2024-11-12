const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const tableRoutes = require('./routes/tableRoutes');  // นำเข้ารูตที่สร้างขึ้น

const app = express();

// ใช้ middleware สำหรับ parsing JSON
app.use(bodyParser.json());

// กำหนด CORS (ถ้าจำเป็น)
app.use(cors());

// ใช้ routes
app.use('/api/tables', tableRoutes);  // กำหนดเส้นทางให้กับ API สำหรับ tables

// ฟังที่ port 5000
app.listen(3030, () => {
    console.log('Server running on http://localhost:3030');
});
