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

// ตั้งค่า CORS
app.use(
    cors({
        origin: "http://localhost:3000", 
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"], 
    })
);

// ใช้ middleware สำหรับ JSON parsing
app.use(express.json());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, 
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API สำหรับ login
app.post("/api/auth/login", async (req, res) => {
    // login user หรือสร้างใหม่ถ้ายังไม่มี
    const { name, email, image } = req.body;
    console.log('login request received:', { name, email, image });

    try {
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('Creating new user...');
            user = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    image: image,
                    role: "USER",
                },
            });
        }

        console.log('User found/created:', user);
        res.json({
            message: "User logged in successfully",
            user: user,
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Failed to log in user" });
    }
});

// API สำหรับสร้าง table
app.post("/api/tables", async (req, res) => {
    // สร้าง table ใหม่
    const { name, userId } = req.body;
    console.log('Create table request received:', { name, userId });

    if (!name || !userId) {
        return res.status(400).json({ message: "Table name and userId are required" });
    }

    try {
        const table = await prisma.table.create({
            data: {
                name: name,
                userId: userId,
            },
        });

        console.log('Table created:', table);
        res.status(201).json(table);
    } catch (error) {
        console.error("Error creating table:", error);
        res.status(500).json({ message: "Failed to create table", error: error.message });
    }
});

// API สำหรับรับข้อมูล table
app.get("/api/gettables", async (req, res) => {
    // รับข้อมูล table สำหรับผู้ใช้
    const { userId } = req.query;
    console.log('Get tables request received for userId:', userId);

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    try {
        const tables = await prisma.table.findMany({
            where: {
                userId: userId,
            },
        });

        console.log('Tables found:', tables);
        if (tables.length === 0) {
            return res.status(404).json({ message: "No tables found for this user" });
        }

        return res.status(200).json(tables);
    } catch (error) {
        console.error("Error fetching tables:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// API สำหรับลบ table
app.delete("/api/tables/:tableId", async (req, res) => {
    // ลบ table ตาม ID
    const { tableId } = req.params;
    const { userId } = req.body;
    console.log('Delete table request received for tableId:', tableId, 'by userId:', userId);

    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    try {
        const table = await prisma.table.findUnique({
            where: {
                id: tableId,
            },
        });

        if (!table) {
            console.log('Table not found with id:', tableId);
            return res.status(404).json({ message: "Table not found" });
        }

        if (table.userId !== userId) {
            console.log('Unauthorized user trying to delete table:', tableId);
            return res.status(403).json({ message: "You do not have permission to delete this table" });
        }

        await prisma.table.delete({
            where: {
                id: tableId,
            },
        });

        console.log('Table deleted successfully:', tableId);
        return res.status(200).json({ message: "Table deleted successfully" });
    } catch (error) {
        console.error("Error deleting table:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// API สำหรับเพิ่มธุรกรรม
app.post('/api/addTransaction', upload.single('image'), async (req, res) => {
    // เพิ่มธุรกรรมใหม่
    const { amount, category, note, userId, tableId, image } = req.body;
    console.log('Add transaction request received:', { amount, category, note, userId, tableId, image });

    if (!amount || !category || !userId || !tableId || (!image && !req.file)) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let filePath = '';
        
        if (image) {
            const base64Image = image.split(';base64,').pop();
            const fileName = `${uuidv4()}.jpg`;
            filePath = path.join(__dirname, 'uploads', fileName);
            fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
        }

        if (req.file) {
            filePath = req.file.path;
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                category,
                note,
                userId,
                tableId,
                date: new Date(),
                attachmentUrl: `http://localhost:3030/${filePath}`,
            },
        });

        console.log('Transaction added successfully:', transaction);
        res.status(200).json({
            message: 'Transaction added successfully',
            transaction: transaction,
        });
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API สำหรับรับธุรกรรม
app.get('/api/transactions/:tableId', async (req, res) => {
    // รับข้อมูลธุรกรรมจาก tableId
    const { tableId } = req.params;
    console.log('Get transactions request received for tableId:', tableId);

    try {
        const transactions = await prisma.transaction.findMany({
            where: { tableId },
        });

        console.log('Transactions found for tableId:', tableId, transactions);
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API สำหรับลบธุรกรรม
app.delete('/api/transactions/:id', async (req, res) => {
    // ลบธุรกรรมตาม ID
    const transactionId = req.params.id;
    console.log('Delete transaction request received for transactionId:', transactionId);

    try {
        const transaction = await prisma.transaction.delete({
            where: {
                id: transactionId,
            },
        });

        console.log('Transaction deleted successfully:', transactionId);
        res.status(200).json({
            message: 'Transaction deleted successfully',
            transaction,
        });
    } catch (error) {
        if (error.code === 'P2025') {
            console.log('Transaction not found with id:', transactionId);
            res.status(404).json({ message: 'Transaction not found' });
        } else {
            console.error('Error deleting transaction:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
