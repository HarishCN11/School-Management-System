const db = require('../config/db');

// Add a schedule item
exports.addScheduleItem = async (req, res) => {
    const { class_id, subject_id, teacher_id, day_of_week, start_time, end_time } = req.body;
    try {
        await db.query(
            'INSERT INTO schedule (class_id, subject_id, teacher_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
            [class_id, subject_id, teacher_id, day_of_week, start_time, end_time]
        );
        res.status(201).json({ message: 'Schedule item added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get schedule for a class
exports.getClassSchedule = async (req, res) => {
    const { class_id } = req.params;
    try {
        const query = `
      SELECT s.day_of_week, s.start_time, s.end_time, sub.name as subject, u.name as teacher_name
      FROM schedule s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN teachers t ON s.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE s.class_id = ?
      ORDER BY FIELD(s.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), s.start_time
    `;
        const [schedule] = await db.query(query, [class_id]);
        res.json(schedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get schedule for a teacher
exports.getTeacherSchedule = async (req, res) => {
    const { teacher_id } = req.params;
    try {
        const query = `
      SELECT s.day_of_week, s.start_time, s.end_time, sub.name as subject, c.name as class_name, c.room_number
      FROM schedule s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN classes c ON s.class_id = c.id
      WHERE s.teacher_id = ?
      ORDER BY FIELD(s.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), s.start_time
    `;
        const [schedule] = await db.query(query, [teacher_id]);
        res.json(schedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
