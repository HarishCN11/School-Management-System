const db = require('../config/db');

exports.getManagedClassDetails = async (req, res) => {
    try {
        // Find if this teacher is a class teacher
        const [teacher] = await db.query('SELECT managed_class_id FROM teachers WHERE user_id = ?', [req.user.id]);

        if (teacher.length === 0 || !teacher[0].managed_class_id) {
            return res.json({ isClassTeacher: false });
        }

        const classId = teacher[0].managed_class_id;

        // Get Class Basic Info
        const [classInfo] = await db.query('SELECT name, room_number FROM classes WHERE id = ?', [classId]);

        // Get Students with Parent Details
        const query = `
            SELECT 
                s.id as student_id, 
                s.admission_number,
                u_std.name as student_name,
                u_std.email as student_email,
                s.address as student_address,
                p.id as parent_id,
                u_prnt.name as parent_name,
                p.phone_number as parent_phone,
                u_prnt.email as parent_email
            FROM students s
            JOIN users u_std ON s.user_id = u_std.id
            LEFT JOIN parents p ON s.id = p.student_id
            LEFT JOIN users u_prnt ON p.user_id = u_prnt.id
            WHERE s.class_id = ?
        `;
        const [students] = await db.query(query, [classId]);

        // Get Inventory Allocated to this class
        const invQuery = `
            SELECT a.id, i.item_name, a.quantity, a.reason, a.allocated_at 
            FROM inventory_allocations a
            JOIN inventory i ON a.inventory_id = i.id
            WHERE a.class_id = ?
        `;
        const [inventory] = await db.query(invQuery, [classId]);

        res.json({
            isClassTeacher: true,
            classInfo: classInfo[0],
            classId,
            studentCount: students.length,
            students,
            inventory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTeacherOwnItems = async (req, res) => {
    try {
        const [teacher] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
        if (teacher.length === 0) return res.status(403).json({ message: 'Not a teacher' });
        const teacherId = teacher[0].id;

        const [materials] = await db.query(`
            SELECT m.*, s.name as subject_name, c.name as class_name
            FROM study_materials m
            JOIN subjects s ON m.subject_id = s.id
            JOIN classes c ON m.class_id = c.id
            WHERE m.teacher_id = ?
            ORDER BY m.uploaded_at DESC
        `, [teacherId]);

        const [assignments] = await db.query(`
            SELECT a.*, s.name as subject_name, c.name as class_name
            FROM assignments a
            JOIN subjects s ON a.subject_id = s.id
            JOIN classes c ON a.class_id = c.id
            WHERE a.teacher_id = ?
            ORDER BY a.created_at DESC
        `, [teacherId]);

        res.json({ materials, assignments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMySubjects = async (req, res) => {
    try {
        const [teacher] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
        if (teacher.length === 0) return res.status(403).json({ message: 'Not a teacher' });
        const teacherId = teacher[0].id;

        const query = `
            SELECT DISTINCT
                sc.class_id,
                c.name as class_name,
                sc.subject_id,
                s.name as subject_name,
                s.code as subject_code
            FROM schedule sc
            JOIN classes c ON sc.class_id = c.id
            JOIN subjects s ON sc.subject_id = s.id
            WHERE sc.teacher_id = ?
        `;
        const [subjects] = await db.query(query, [teacherId]);
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
