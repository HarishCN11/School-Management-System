const db = require('../config/db');

// Get materials for a student (based on their class)
exports.getMaterialsForStudent = async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const [student] = await db.query('SELECT class_id FROM students WHERE id = ?', [studentId]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });
        const classId = student[0].class_id;

        const [materials] = await db.query(`
            SELECT m.*, s.name as subject_name, t.name as teacher_name
            FROM study_materials m
            JOIN subjects s ON m.subject_id = s.id
            JOIN teachers th ON m.teacher_id = th.id
            JOIN users t ON th.user_id = t.id
            WHERE m.class_id = ?
            ORDER BY m.uploaded_at DESC
        `, [classId]);

        res.json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Teacher: Upload Material
exports.uploadMaterial = async (req, res) => {
    let { title, description, class_id, subject_id, teacher_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'File is required' });

    try {
        if (!teacher_id) {
            const [teacher] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
            if (teacher.length === 0) return res.status(403).json({ message: 'Not authorized as a teacher' });
            teacher_id = teacher[0].id;
        }

        const filePath = `/uploads/${file.filename}`;
        await db.query(
            'INSERT INTO study_materials (title, description, class_id, subject_id, teacher_id, file_path) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, class_id, subject_id, teacher_id, filePath]
        );
        res.status(201).json({ message: 'Material uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Teacher: Delete Material
exports.deleteMaterial = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM study_materials WHERE id = ?', [id]);
        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get materials by class
exports.getMaterialsByClass = async (req, res) => {
    const { classId } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT m.*, s.name as subject_name, u.name as teacher_name
            FROM study_materials m
            LEFT JOIN subjects s ON m.subject_id = s.id
            LEFT JOIN teachers t ON m.teacher_id = t.id
            LEFT JOIN users u ON t.user_id = u.id
            WHERE m.class_id = ?
            ORDER BY m.uploaded_at DESC
        `, [classId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

