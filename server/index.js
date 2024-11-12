const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// ตั้งค่า CORS: อนุญาตให้เข้าใช้งานจาก 'http://localhost:3000'
app.use(
    cors({
        origin: "http://localhost:3000", // URL ของ React app
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // กำหนดวิธีการที่อนุญาต
        allowedHeaders: ["Content-Type", "Authorization"], // กำหนด headers ที่อนุญาต
    })
);

// ใช้ middleware สำหรับ JSON parsing
app.use(express.json());
app.use(express.json({ limit: '100mb' }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // ระบุที่เก็บไฟล์
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 2000 * 2000 }, 
  });

// login ------------------------------------------------------------------------------------------------------------
app.post("/api/auth/login", async (req, res) => {
    const { name, email, image } = req.body;

    try {
        // ตรวจสอบผู้ใช้จาก email
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    image: image,
                    role: "USER", // ตั้งบทบาทผู้ใช้เป็น USER
                },
            });
        }

        res.json({
            message: "User logged in successfully",
            user: user,
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Failed to log in user" });
    }
});
// login ------------------------------------------------------------------------------------------------------------
// table ------------------------------------------------------------------------------------------------------------
app.post("/api/tables", async (req, res) => {
    const { name, userId } = req.body;

    // ตรวจสอบว่า name และ userId ถูกส่งมาหรือไม่
    if (!name || !userId) {
        return res.status(400).json({ message: "Table name and userId are required" });
    }

    try {
        // สร้าง table ใหม่ในฐานข้อมูล
        const table = await prisma.table.create({
            data: {
                name: name,
                userId: userId,
            },
        });

        // ส่งกลับข้อมูลของ table ที่ถูกสร้าง
        res.status(201).json(table);
    } catch (error) {
        console.error("Error creating table:", error);
        res.status(500).json({ message: "Failed to create table", error: error.message });
    }
});
app.get("/api/gettables", async (req, res) => {
    const { userId } = req.query; // รับค่า userId จาก query parameter
    console.log(userId)
    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    try {
        // ค้นหาตารางทั้งหมดที่เกี่ยวข้องกับ userId
        const tables = await prisma.table.findMany({
            where: {
                userId: userId, // ค้นหาตาม userId
            },
        });

        if (tables.length === 0) {
            return res.status(404).json({ message: "No tables found for this user" });
        }

        return res.status(200).json(tables); // ส่งตารางทั้งหมดที่พบ
    } catch (error) {
        console.error("Error fetching tables:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
app.delete("/api/tables/:tableId", async (req, res) => {
    const { tableId } = req.params;
    const { userId } = req.body; // รับ userId จาก body ของ request

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    try {
        // ตรวจสอบว่า table ที่กำลังจะลบเป็นของผู้ใช้ที่ถูกต้องหรือไม่
        const table = await prisma.table.findUnique({
            where: {
                id: tableId,
            },
        });

        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }

        if (table.userId !== userId) {
            return res.status(403).json({ message: "You do not have permission to delete this table" });
        }

        // ลบ table
        await prisma.table.delete({
            where: {
                id: tableId,
            },
        });

        return res.status(200).json({ message: "Table deleted successfully" });
    } catch (error) {
        console.error("Error deleting table:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
// table ------------------------------------------------------------------------------------------------------------
// Transaction ------------------------------------------------------------------------------------------------------------
app.post('/api/addTransaction', async (req, res) => {
    const { amount, category, note, userId, tableId, image } = req.body;
  
    if (!amount || !category || !userId || !tableId || !image) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      // Decode the base64 image
      const base64Image = image.split(';base64,').pop();
      const fileName = `${uuidv4()}.jpg`; // Unique file name
      const filePath = path.join(__dirname, 'uploads', fileName);
  
      // Save the image to the uploads folder
      fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
  
      // Create the transaction in the database
      const transaction = await prisma.transaction.create({
        data: {
          amount: parseFloat(amount),
          category,
          note,
          userId,
          tableId,
          date: new Date(), // Setting the date to the current date
          attachmentUrl: `http://localhost:3030/uploads/${fileName}`,
        },
      });
  
      res.status(200).json({
        message: 'Transaction added successfully',
        transaction: transaction,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
app.get('/api/transactions/:tableId', async (req, res) => {
    const { tableId } = req.params;
  
    try {
      const transactions = await prisma.transaction.findMany({
        where: { tableId },
      });
  
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
app.delete('/api/transactions/:id', async (req, res) => {
    const transactionId = req.params.id;
  
    try {
      // Find and delete the transaction by its ID
      const transaction = await prisma.transaction.delete({
        where: {
          id: transactionId, // The id of the transaction to delete
        },
      });
  
      // If the transaction is found and deleted, respond with success
      res.status(200).json({
        message: 'Transaction deleted successfully',
        transaction,
      });
    } catch (error) {
      // If the transaction does not exist or other error, send error response
      if (error.code === 'P2025') { // Prisma error code for "record not found"
        res.status(404).json({ message: 'Transaction not found' });
      } else {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });
// Transaction ------------------------------------------------------------------------------------------------------------




app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });
// กำหนดพอร์ต
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
