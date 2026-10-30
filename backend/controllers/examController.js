const db = require('../config/db');

// Create a new exam
exports.createExam = async (req, res) => {
    const { name, class_id, subject_id, exam_date, total_marks } = req.body;
    try {
        await db.query(
            'INSERT INTO exams (name, class_id, subject_id, exam_date, total_marks) VALUES (?, ?, ?, ?, ?)',
            [name, class_id, subject_id, exam_date, total_marks || 100]
        );
        res.status(201).json({ message: 'Exam scheduled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Record results for a student or multiple students
exports.recordResults = async (req, res) => {
    const { exam_id, results_data } = req.body;
    // results_data: [{ student_id, marks_obtained }]

    if (!results_data || !Array.isArray(results_data)) {
        return res.status(400).json({ message: 'Invalid results data' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        for (const result of results_data) {
            await connection.query(
                'INSERT INTO results (exam_id, student_id, marks_obtained) VALUES (?, ?, ?)',
                [exam_id, result.student_id, result.marks_obtained]
            );
        }

        await connection.commit();
        res.json({ message: 'Results recorded successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

// Get results for a specific student
exports.getStudentResults = async (req, res) => {
    const { student_id } = req.params;
    try {
        const query = `
      SELECT r.marks_obtained, e.name as exam_name, e.total_marks, e.exam_date, s.name as subject_name
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      WHERE r.student_id = ?
    `;
        const [results] = await db.query(query, [student_id]);

        // Also fetch Overall Academic Record for position/rank
        const [academicRecords] = await db.query(
            'SELECT class_position, total_marks as grand_total, average_marks, teacher_remarks FROM academic_records WHERE student_id = ? ORDER BY created_at DESC LIMIT 1',
            [student_id]
        );

        res.json({
            exam_results: results,
            academic_record: academicRecords.length > 0 ? academicRecords[0] : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get results for an entire class for a specific exam
exports.getClassExamResults = async (req, res) => {
    const { exam_id } = req.params;
    try {
        const query = `
      SELECT r.marks_obtained, u.name as student_name, s.id as student_id
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE r.exam_id = ?
    `;
        const [results] = await db.query(query, [exam_id]);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
