const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ฟังก์ชันสำหรับการสร้าง table
const createTable = async (req, res) => {
    const { name, userId } = req.body;

    try {
        const newTable = await prisma.table.create({
            data: {
                name: name,
                userId: userId,
            },
        });
        res.status(201).json(newTable);
    } catch (error) {
        console.error('Error creating table:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTable };
