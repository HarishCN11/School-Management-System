const db = require('../config/db');
require('dotenv').config();

async function seedExamData() {
    try {
        const connection = await db.getConnection();
        console.log('Connected to database for exam seeding...');

        // 1. Get Student ID
        console.log("Looking for student via email...");
        const [users] = await connection.query("SELECT * FROM users WHERE email = 'student1@school.com'");
        console.log("Users found:", users.length);
        if (users.length > 0) console.log("User ID:", users[0].id);

        const [studentRows] = await connection.query(`
            SELECT s.id, s.class_id 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE u.email = 'student1@school.com'
        `);
        console.log("Student profiles found:", studentRows.length);

        if (studentRows.length === 0) {
            console.error('Student not found. Please run initial seed first.');
            process.exit(1);
        }

        const student = studentRows[0];
        const studentId = student.id;
        const classId = student.class_id || 1;

        // 2. Ensure Subjects Exist
        const subjects = ['Mathematics', 'Science', 'English', 'History', 'Tamil'];
        const subjectIds = {};

        for (const subj of subjects) {
            await connection.query('INSERT IGNORE INTO subjects (name, code) VALUES (?, ?)', [subj, subj.substring(0, 3).toUpperCase()]);
            const [rows] = await connection.query('SELECT id FROM subjects WHERE name = ?', [subj]);
            subjectIds[subj] = rows[0].id;
        }

        // 3. Create Exams for 3 Terms
        const terms = ['Term 1', 'Term 2', 'Term 3'];
        const examIds = [];

        // Clear old results/exams for cleanliness (Optional, but good for demo)
        // await connection.query('DELETE FROM results WHERE student_id = ?', [studentId]);

        for (const term of terms) {
            for (const subj of subjects) {
                const examName = `${subj} - ${term}`;
                // Insert Exam
                await connection.query(
                    'INSERT INTO exams (name, class_id, subject_id, exam_date, total_marks, term) VALUES (?, ?, ?, CURDATE(), 100, ?)',
                    [examName, classId, subjectIds[subj], term]
                );

                // Get Exam ID
                const [examRow] = await connection.query('SELECT id FROM exams WHERE name = ? ORDER BY id DESC LIMIT 1', [examName]);
                const examId = examRow[0].id;

                // 4. Insert Result (Random marks between 60 and 100)
                const marks = Math.floor(Math.random() * (100 - 60 + 1)) + 60;

                await connection.query(
                    'INSERT IGNORE INTO results (exam_id, student_id, marks_obtained) VALUES (?, ?, ?)',
                    [examId, studentId, marks]
                );
            }
        }

        // 5. Insert Academic Record (Rank/Position)
        await connection.query(
            'INSERT INTO academic_records (student_id, academic_year, total_marks, average_marks, class_position, teacher_remarks) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total_marks=VALUES(total_marks)',
            [studentId, '2025-2026', 1320, 88.00, 5, 'Excellent performance throughout the year. Keep it up!']
        );

        console.log('Seeding Exam Data Complete!');
        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedExamData();
