const db = require('../config/db');

// --- Classes ---

exports.getAllClasses = async (req, res) => {
    try {
        const [classes] = await db.query('SELECT * FROM classes');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createClass = async (req, res) => {
    const { name, room_number, capacity } = req.body;
    try {
        const cap = parseInt(capacity) || 100;
        const [result] = await db.query('INSERT INTO classes (name, room_number, capacity) VALUES (?, ?, ?) RETURNING id', [name, room_number, cap]);
        res.status(201).json({ message: 'Class created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateClass = async (req, res) => {
    const { name, room_number, capacity } = req.body;
    const classId = req.params.id;
    
    try {
        const cap = parseInt(capacity) || 100;
        const [result] = await db.query(
            'UPDATE classes SET name = ?, room_number = ?, capacity = ? WHERE id = ?', 
            [name, room_number, cap, classId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Class not found' });
        }
        
        res.json({ message: 'Class updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        await db.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Subjects ---

exports.getAllSubjects = async (req, res) => {
    try {
        const [subjects] = await db.query('SELECT * FROM subjects');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSubject = async (req, res) => {
    const { name, code } = req.body;
    try {
        await db.query('INSERT INTO subjects (name, code) VALUES (?, ?)', [name, code]);
        res.status(201).json({ message: 'Subject created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSubject = async (req, res) => {
    const { name, code } = req.body;
    try {
        await db.query('UPDATE subjects SET name = ?, code = ? WHERE id = ?', [name, code, req.params.id]);
        res.json({ message: 'Subject updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        await db.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const [[studentCount]] = await db.query('SELECT COUNT(*) as count FROM students');
        const [[teacherCount]] = await db.query('SELECT COUNT(*) as count FROM teachers');
        const [[classCount]] = await db.query('SELECT COUNT(*) as count FROM classes');
        const [[userCount]] = await db.query('SELECT COUNT(*) as count FROM users');

        res.json({
            students: studentCount.count,
            teachers: teacherCount.count,
            classes: classCount.count,
            users: userCount.count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTeacherStats = async (req, res) => {
    const { teacherId } = req.params;
    try {
        // Always look up by user_id (from JWT) first to get the real teacher record
        // Then also support legacy teacherId param for schedule-based lookups
        
        // Get teacher's managed class by user JWT (most accurate)
        let managedClassId = null;
        let teacherDbId = null;
        
        if (req.user) {
            const [tRow] = await db.query('SELECT id, managed_class_id FROM teachers WHERE user_id = ?', [req.user.id]);
            if (tRow.length > 0) {
                managedClassId = tRow[0].managed_class_id;
                teacherDbId = tRow[0].id;
            }
        }
        
        // Fallback to teacherId param if JWT lookup failed
        if (!teacherDbId && teacherId) {
            const [tRow] = await db.query('SELECT id, managed_class_id FROM teachers WHERE id = ?', [teacherId]);
            if (tRow.length > 0) {
                managedClassId = tRow[0].managed_class_id;
                teacherDbId = tRow[0].id;
            }
        }

        if (!teacherDbId) {
            return res.json({ classes: 0, students: 0, pendingMarks: 0 });
        }

        // Count classes teacher teaches (via schedule)
        const [[classCount]] = await db.query('SELECT COUNT(DISTINCT class_id) as count FROM schedule WHERE teacher_id = ?', [teacherDbId]);
        
        // Count students in managed class (same source as getManagedClassDetails)
        let studentCount = 0;
        if (managedClassId) {
            const [[sc]] = await db.query('SELECT COUNT(*) as count FROM students WHERE class_id = ?', [managedClassId]);
            studentCount = sc.count || 0;
        }

        // Count pending marks in submissions
        const [[pendingMarks]] = await db.query(`
            SELECT COUNT(*) as count 
            FROM submissions sub
            JOIN assignments a ON sub.assignment_id = a.id
            JOIN schedule sch ON a.class_id = sch.class_id AND a.subject_id = sch.subject_id
            WHERE sch.teacher_id = ? AND sub.marks IS NULL`, [teacherDbId]);

        res.json({
            classes: classCount.count || 0,
            students: studentCount,
            pendingMarks: pendingMarks.count || 0,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentStats = async (req, res) => {
    const { studentId } = req.params;
    try {
        const [[student]] = await db.query('SELECT class_id FROM students WHERE id = ?', [studentId]);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const [[courseCount]] = await db.query('SELECT COUNT(DISTINCT s.name) as count FROM schedule sch JOIN subjects s ON sch.subject_id = s.id WHERE sch.class_id = ?', [student.class_id]);
        const [[examCount]] = await db.query('SELECT COUNT(*) as count FROM exams WHERE class_id = ? AND exam_date >= CURRENT_DATE', [student.class_id]);
        const [[assignmentCount]] = await db.query('SELECT COUNT(*) as count FROM assignments WHERE class_id = ?', [student.class_id]);
        
        const [[attendanceData]] = await db.query(`
            SELECT 
                ROUND((COUNT(CASE WHEN status IN ('present', 'late', 'excused') THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 1) as rate 
            FROM attendance 
            WHERE student_id = ?`, [studentId]);

        let courseCountVal = courseCount.count || 0;
        if (courseCountVal === 0) {
            const [[fallbackCount]] = await db.query('SELECT COUNT(DISTINCT name) as count FROM subjects');
            courseCountVal = fallbackCount.count || 0;
        }

        res.json({
            courses: courseCountVal,
            exams: examCount.count || 0,
            assignments: assignmentCount.count || 0,
            attendance: attendanceData.rate || '0'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
