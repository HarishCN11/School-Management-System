const db = require('./config/db');

async function populate() {
    try {
        const studentEmail = 'student1@school.com'; // Let's use student1 for testing report
        const [studentRows] = await db.query('SELECT s.id, s.class_id FROM students s JOIN users u ON s.user_id = u.id WHERE u.email = ?', [studentEmail]);

        if (studentRows.length === 0) {
            console.log('Student not found');
            process.exit(1);
        }

        const studentId = studentRows[0].id;
        const classId = studentRows[0].class_id;

        const terms = ['First Installment', 'Second Installment', 'Third Installment'];

        // Clear existing results for this student to avoid duplicates
        await db.query('DELETE FROM results WHERE student_id = ?', [studentId]);

        const [subjects] = await db.query('SELECT id FROM subjects');

        for (const term of terms) {
            for (const subj of subjects) {
                // Find or create exam for this subject and term
                let [exams] = await db.query('SELECT id FROM exams WHERE name = ? AND subject_id = ? AND class_id = ?', [term, subj.id, classId]);

                let examId;
                if (exams.length === 0) {
                    const [res] = await db.query('INSERT INTO exams (name, class_id, subject_id, exam_date, total_marks) VALUES (?, ?, ?, CURDATE(), 100)', [term, classId, subj.id]);
                    examId = res.insertId;
                } else {
                    examId = exams[0].id;
                }

                // Random mark between 40 and 98
                const mark = Math.floor(Math.random() * (98 - 40 + 1)) + 40;
                await db.query('INSERT INTO results (exam_id, student_id, marks_obtained) VALUES (?, ?, ?)', [examId, studentId, mark]);
            }
        }

        console.log('✅ Sample results populated for student1@school.com');
        process.exit(0);
    } catch (error) {
        console.error('❌ Populate failed:', error);
        process.exit(1);
    }
}

populate();
