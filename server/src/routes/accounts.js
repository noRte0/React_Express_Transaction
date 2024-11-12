const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authenticateJWT = require('../middlewares/authenticateJWT');

router.post('/', authenticateJWT, accountController.createAccount);
router.delete('/:id', authenticateJWT, accountController.deleteAccount);

module.exports = router;

app.post('/api/auth/login', async (req, res) => {
    const { name, email } = req.body; // รับข้อมูลจาก Client (name, email)
  
    try {
      // สร้างผู้ใช้ใหม่ในฐานข้อมูล (หรืออัพเดตข้อมูลผู้ใช้ที่มีอยู่)
      const user = await prisma.user.create({
        data: {
          name: name,
          email: email,
        },
      });
  
      // ส่งข้อมูลการตอบกลับเมื่อสร้างผู้ใช้สำเร็จ
      res.json({
        message: 'User created successfully',
        user: user,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });