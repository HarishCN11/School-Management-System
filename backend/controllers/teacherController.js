const db = require('../config/db');

// Get all teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const query = `
      SELECT t.id, u.id as user_id, u.name, u.email, t.qualification, t.specialization, t.phone_number, t.address, t.managed_class_id, c.name as managed_class_name
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN classes c ON t.managed_class_id = c.id
    `;
        const [teachers] = await db.query(query);
        res.json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create teacher profile
exports.createTeacherProfile = async (req, res) => {
    const { user_id, qualification, specialization, phone_number, address, managed_class_id } = req.body;

    try {
        await db.query(
            'INSERT INTO teachers (user_id, qualification, specialization, phone_number, address, managed_class_id) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, qualification, specialization, phone_number, address, managed_class_id || null]
        );
        res.status(201).json({ message: 'Teacher profile created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Teacher
exports.updateTeacher = async (req, res) => {
    const { name, email, qualification, specialization, phone_number, address, managed_class_id } = req.body;
    const teacherId = req.params.id;

    try {
        const [teacher] = await db.query('SELECT user_id FROM teachers WHERE id = ?', [teacherId]);
        if (teacher.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const userId = teacher[0].user_id;

        await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
        await db.query(
            'UPDATE teachers SET qualification = ?, specialization = ?, phone_number = ?, address = ?, managed_class_id = ? WHERE id = ?',
            [qualification, specialization, phone_number, address, managed_class_id || null, teacherId]
        );

        res.json({ message: 'Teacher updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Teacher
exports.deleteTeacher = async (req, res) => {
    const teacherId = req.params.id;

    try {
        const [teacher] = await db.query('SELECT user_id FROM teachers WHERE id = ?', [teacherId]);
        if (teacher.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const userId = teacher[0].user_id;

        // 1. Handle dependencies to avoid Foreign Key violations (Internal Server Error 500)
        
        // Remove from schedule
        await db.query('DELETE FROM schedule WHERE teacher_id = ?', [teacherId]);
        
        // Remove materials
        await db.query('DELETE FROM study_materials WHERE teacher_id = ?', [teacherId]);
        
        // Remove feedback
        await db.query('DELETE FROM feedback WHERE teacher_id = ?', [teacherId]);
        await db.query('DELETE FROM student_feedback WHERE teacher_id = ?', [teacherId]);
        
        // Remove assignment submissions first, then assignments
        await db.query('DELETE FROM submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE teacher_id = ?)', [teacherId]);
        await db.query('DELETE FROM assignments WHERE teacher_id = ?', [teacherId]);

        // 2. Finally delete the teacher profile and user account
        await db.query('DELETE FROM teachers WHERE id = ?', [teacherId]);
        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        res.json({ message: 'Teacher and all associated data deleted successfully' });
    } catch (error) {
        console.error('Delete Teacher Error:', error);
        res.status(500).json({ 
            message: 'Server error: could not delete teacher. There may be linked records in other tables.',
            error: error.message 
        });
    }
};
