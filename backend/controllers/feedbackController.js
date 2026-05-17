const db = require('../config/db');

exports.submitFeedback = async (req, res) => {
    const { teacher_id, message } = req.body;
    const user_id = req.user.id;

    if (!teacher_id || !message) {
        return res.status(400).json({ message: 'Teacher ID and message are required' });
    }

    try {
        // Find parent_id from user_id
        const [parents] = await db.query('SELECT id, student_id FROM parents WHERE user_id = ?', [user_id]);
        if (parents.length === 0) {
            return res.status(403).json({ message: 'Only parents can submit feedback' });
        }
        const parent_id = parents[0].id;
        const finalStudentId = req.body.student_id || parents[0].student_id;

        await db.query(
            'INSERT INTO feedback (parent_id, teacher_id, student_id, message) VALUES (?, ?, ?, ?)',
            [parent_id, teacher_id, finalStudentId, message]
        );

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Submit Feedback Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTeacherFeedback = async (req, res) => {
    const user_id = req.user.id;
    try {
        // Find teacher_id from user_id
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [user_id]);
        if (teachers.length === 0) {
            return res.status(403).json({ message: 'Only teachers can view this feedback' });
        }
        const teacher_id = teachers[0].id;

        const query = `
            SELECT f.*, u.name as parent_name, u.email as parent_email
            FROM feedback f
            JOIN parents p ON f.parent_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE f.teacher_id = ?
            ORDER BY f.created_at DESC
        `;
        const [rows] = await db.query(query, [teacher_id]);
        res.json(rows);
    } catch (error) {
        console.error('Get Teacher Feedback Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getParentFeedback = async (req, res) => {
    const user_id = req.user.id;
    try {
        const [parents] = await db.query('SELECT id FROM parents WHERE user_id = ?', [user_id]);
        if (parents.length === 0) return res.status(403).json({ message: 'Unauthorized' });
        const parent_id = parents[0].id;

        const query = `
            SELECT f.*, u.name as teacher_name
            FROM feedback f
            JOIN teachers t ON f.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE f.parent_id = ?
            ORDER BY f.created_at DESC
        `;
        const [rows] = await db.query(query, [parent_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getChildStats = async (req, res) => {
    const user_id = req.user.id;
    try {
        // 1. Find the parent and their child
        const [parents] = await db.query(`
            SELECT p.student_id, u.name as student_name, st.class_id, c.name as class_name
            FROM parents p
            JOIN students st ON p.student_id = st.id
            JOIN users u ON st.user_id = u.id
            JOIN classes c ON st.class_id = c.id
            WHERE p.user_id = ?
        `, [user_id]);

        if (parents.length === 0 || !parents[0].student_id) {
            return res.status(404).json({ message: 'No child linked to this parent account.' });
        }

        const { student_id, student_name, class_id, class_name } = parents[0];

        // 2. Get attendance summary
        const [attendance] = await db.query(`
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days
            FROM attendance
            WHERE student_id = ?
        `, [student_id]);

        // 3. Get latest results
        const [results] = await db.query(`
            SELECT r.marks_obtained, e.total_marks, e.name as exam_name, s.name as subject_name
            FROM results r
            JOIN exams e ON r.exam_id = e.id
            JOIN subjects s ON e.subject_id = s.id
            WHERE r.student_id = ?
            ORDER BY e.exam_date DESC
            LIMIT 5
        `, [student_id]);

        // 4. Get ALL teachers for feedback options as requested
        const [teachers] = await db.query(`
            SELECT t.id, u.name, u.email, t.specialization as subject
            FROM teachers t
            JOIN users u ON t.user_id = u.id
        `);

        res.json({
            student: {
                id: student_id,
                name: student_name,
                class: class_name
            },
            attendance: {
                total: attendance[0].total_days,
                present: attendance[0].present_days,
                percentage: attendance[0].total_days > 0
                    ? Math.round((attendance[0].present_days / attendance[0].total_days) * 100)
                    : 0
            },
            recentResults: results,
            teachers: teachers
        });

    } catch (error) {
        console.error('Get Child Stats Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.submitStudentFeedback = async (req, res) => {
    const { teacher_id, message } = req.body;
    const user_id = req.user.id;

    if (!teacher_id || !message) {
        return res.status(400).json({ message: 'Teacher ID and message are required' });
    }

    try {
        if (req.user.role.toLowerCase() !== 'student') {
            return res.status(403).json({ message: 'Only students can submit this feedback' });
        }

        await db.query(
            'INSERT INTO student_feedback (user_id, teacher_id, message) VALUES (?, ?, ?)',
            [user_id, teacher_id, message]
        );

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Submit Student Feedback Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTeacherStudentFeedback = async (req, res) => {
    const user_id = req.user.id;
    try {
        const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [user_id]);
        if (teachers.length === 0) {
            return res.status(403).json({ message: 'Only teachers can view this feedback' });
        }
        const teacher_id = teachers[0].id;

        const query = `
            SELECT sf.*, u.name as student_name, c.name as class_name
            FROM student_feedback sf
            JOIN users u ON sf.user_id = u.id
            LEFT JOIN students s ON s.user_id = u.id
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE sf.teacher_id = ?
            ORDER BY sf.created_at DESC
        `;
        const [rows] = await db.query(query, [teacher_id]);
        res.json(rows);
    } catch (error) {
        console.error('Get Teacher Student Feedback Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentTeachersForFeedback = async (req, res) => {
    try {
        const [teachers] = await db.query(`
            SELECT t.id, u.name, t.specialization as subject
            FROM teachers t
            JOIN users u ON t.user_id = u.id
        `);
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
