const prisma = require('../config/prismaClient');

// เพิ่มบัญชีใช้จ่าย
exports.createAccount = async (req, res) => {
    try {
        const account = await prisma.account.create({
            data: {
                userId: req.user.id,
                type: req.body.type,
                provider: req.body.provider,
                providerAccountId: req.body.providerAccountId,
            },
        });
        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ลบบัญชีใช้จ่าย
exports.deleteAccount = async (req, res) => {
    try {
        await prisma.account.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
