const db = require('../config/db');

exports.markAttendance = async (req, res) => {
    const { class_id, date, attendance_data } = req.body;
    // attendance_data should be an array of { student_id, status }

    if (!attendance_data || !Array.isArray(attendance_data)) {
        return res.status(400).json({ message: 'Invalid attendance data' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        for (const record of attendance_data) {
            await connection.query(
                'INSERT INTO attendance (student_id, class_id, date, status) VALUES (?, ?, ?, ?)',
                [record.student_id, class_id, date, record.status]
            );
        }

        await connection.commit();
        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

exports.getAttendanceByClassAndDate = async (req, res) => {
    const { class_id, date } = req.params;
    try {
        const query = `
      SELECT a.*, u.name as student_name 
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE a.class_id = ? AND a.date = ?
    `;
        const [attendance] = await db.query(query, [class_id, date]);
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
