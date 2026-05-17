const db = require('../config/db');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const query = `
      SELECT s.id, u.id as user_id, u.name, u.email, c.name as class_name, s.class_id, s.admission_number, s.dob, s.address, s.gender
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
    `;
        const [students] = await db.query(query);
        res.json(students);
    } catch (error) {
        console.error('Fetch Students Error:', error);
        res.status(500).json({ message: 'Failed to retrieve students' });
    }
};

// Create profile
exports.createStudentProfile = async (req, res) => {
    const { user_id, class_id, admission_number, dob, address, gender } = req.body;

    if (!user_id || !admission_number) {
        return res.status(400).json({ message: 'User ID and Admission Number are required' });
    }

    try {
        const finalClassId = class_id === '' ? null : class_id;
        const finalDob = dob === '' ? null : dob;
        const finalGender = gender === '' ? null : gender;

        await db.query(
            'INSERT INTO students (user_id, class_id, admission_number, dob, address, gender) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, finalClassId, admission_number, finalDob, address, finalGender]
        );
        res.status(201).json({ message: 'Student profile created' });
    } catch (error) {
        console.error('Create Student Profile Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: `Admission ID '${admission_number}' is already assigned to another student.` });
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// Update Student
exports.updateStudent = async (req, res) => {
    const { name, email, class_id, admission_number, dob, address, gender } = req.body;
    const studentId = req.params.id;

    try {
        const [student] = await db.query('SELECT user_id FROM students WHERE id = ?', [studentId]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });
        const userId = student[0].user_id;

        // Update User table
        await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);

        // Update Students table
        const finalClassId = class_id === '' ? null : class_id;
        const finalDob = dob === '' ? null : dob;
        const finalGender = gender === '' ? null : gender;

        await db.query(
            'UPDATE students SET class_id = ?, admission_number = ?, dob = ?, address = ?, gender = ? WHERE id = ?',
            [finalClassId, admission_number, finalDob, address, finalGender, studentId]
        );

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Update Student Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Update failed: Admission ID or Email is already in use.' });
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
    const studentId = req.params.id;
    try {
        const [student] = await db.query('SELECT user_id FROM students WHERE id = ?', [studentId]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });
        const userId = student[0].user_id;

        // Explicitly delete profile first to ensure cleanup if cascade is missing
        await db.query('DELETE FROM students WHERE id = ?', [studentId]);
        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        res.json({ message: 'Student and associated user account deleted successfully' });
    } catch (error) {
        console.error("Delete Student Error:", error);
        res.status(500).json({ message: 'Failed to delete student' });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const query = `
      SELECT s.id, u.id as user_id, u.name, u.email, c.name as class_name, s.class_id, s.admission_number, s.dob, s.address, s.gender
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `;
        const [students] = await db.query(query, [req.params.id]);
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        res.json(students[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
