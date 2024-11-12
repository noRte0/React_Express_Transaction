const prisma = require('../config/prismaClient');

// ระบบสรุปยอดใช้จ่าย
exports.getTransactionsSummary = async (req, res) => {
    const { month, year, category, account, limit = 10, page = 1 } = req.query;
    const filters = {
        ...(month && { month: parseInt(month) }),
        ...(year && { year: parseInt(year) }),
        ...(category && { category }),
        ...(account && { account }),
    };
    const skip = (page - 1) * limit;

    try {
        const transactions = await prisma.transaction.findMany({
            where: filters,
            skip,
            take: parseInt(limit),
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactionsSummary = async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    try {
        const transactions = await prisma.transaction.findMany({
            skip,
            take: parseInt(limit),
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// เพิ่มธุรกรรมใหม่
exports.createTransaction = async (req, res) => {
    try {
        const { tableId, category, amount, date, note } = req.body;
        
        const transaction = await prisma.transaction.create({
            data: {
                tableId,
                userId: req.user.id, // คาดว่า req.user.id มาจากระบบ auth
                category,
                amount,
                date: new Date(date),
                note,
            },
        });
        
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
