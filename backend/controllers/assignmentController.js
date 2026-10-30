const db = require('../config/db');

// Get assignments for a student (based on their class)
exports.getAssignmentsForStudent = async (req, res) => {
    const studentId = req.params.studentId;

    try {
        // First get student's class
        const [student] = await db.query('SELECT class_id FROM students WHERE id = ?', [studentId]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });

        const classId = student[0].class_id;

        // Get assignments for that class
        const [assignments] = await db.query(`
            SELECT a.*, s.name as subject_name, sub.marks, sub.remarks,
            (CASE WHEN sub.id IS NOT NULL THEN 1 ELSE 0 END) as is_submitted
            FROM assignments a
            LEFT JOIN subjects s ON a.subject_id = s.id
            LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
            WHERE a.class_id = ?
            ORDER BY a.due_date ASC
        `, [studentId, classId]);

        res.json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit an assignment
exports.submitAssignment = async (req, res) => {
    const { assignment_id, student_id } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'File is required' });
    }

    try {
        const filePath = file.url || `/uploads/${file.filename}`;
        await db.query(
            'INSERT INTO submissions (assignment_id, student_id, file_path) VALUES (?, ?, ?)',
            [assignment_id, student_id, filePath]
        );
        res.status(201).json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Teacher: Create Assignment
exports.createAssignment = async (req, res) => {
    const { title, description, class_id, subject_id, due_date } = req.body;
    const file = req.file;
    const filePath = file ? (file.url || `/uploads/${file.filename}`) : null;

    try {
        // Find teacher_id from user_id (req.user.id)
        const [teacher] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
        if (teacher.length === 0) return res.status(403).json({ message: 'Not authorized as a teacher' });
        const teacher_id = teacher[0].id;

        const [result] = await db.query(
            'INSERT INTO assignments (title, description, class_id, subject_id, teacher_id, due_date, file_path) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
            [title, description, class_id, subject_id, teacher_id, due_date, filePath]
        );
        res.status(201).json({ id: result.insertId, message: 'Assignment created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Teacher: Update Assignment Status (Manually Close)
exports.updateAssignmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query('UPDATE assignments SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Assignment marked as ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Teacher: Delete Assignment
exports.deleteAssignment = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM assignments WHERE id = ?', [id]);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Teacher: Get All Submissions (with details)
exports.getAllSubmissions = async (req, res) => {
    try {
        // Ideally filter by teacher's classes but for now fetch all
        const [submissions] = await db.query(`
            SELECT sub.*, a.title as assignment_title, u.name as student_name 
            FROM submissions sub
            JOIN assignments a ON sub.assignment_id = a.id
            JOIN students st ON sub.student_id = st.id
            JOIN users u ON st.user_id = u.id
            ORDER BY sub.submitted_at DESC
        `);
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Teacher: Grade Submission
exports.gradeSubmission = async (req, res) => {
    const { id } = req.params;
    const { marks, remarks } = req.body;

    try {
        await db.query('UPDATE submissions SET marks = ?, remarks = ? WHERE id = ?', [marks, remarks, id]);
        res.json({ message: 'Graded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get assignments by class
exports.getAssignmentsByClass = async (req, res) => {
    const { classId } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM assignments WHERE class_id = ? ORDER BY created_at DESC', [classId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
