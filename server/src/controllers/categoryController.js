const prisma = require('../config/prismaClient');

// เพิ่มประเภทการใช้จ่าย
exports.createCategory = async (req, res) => {
    try {
        const category = await prisma.category.create({
            data: { name: req.body.name },
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ลบประเภทการใช้จ่าย
exports.deleteCategory = async (req, res) => {
    try {
        await prisma.category.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
