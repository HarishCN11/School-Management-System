const db = require('./config/db');

async function seed() {
    try {
        console.log('Seeding special subjects and terms...');

        // 1. Clear old subjects (optional but recommended for a clean start on special request)
        // await db.query('DELETE FROM subjects'); 

        const subjects = [
            ['Religion', 'REL'],
            ['1st Language', 'L1'],
            ['Mathematics', 'MATH'],
            ['Environmental Activities', 'ENV'],
            ['English', 'ENG'],
            ['Sinhala', 'SIN'],
            ['Creative Activities', 'CRE'],
            ['Aesthetic', 'AES'],
            ['Physical Education', 'PE'],
            ['Drawing', 'DRW']
        ];

        for (const [name, code] of subjects) {
            await db.query('INSERT IGNORE INTO subjects (name, code) VALUES (?, ?)', [name, code]);
        }

        // 2. Create Exams for Terms (Installments)
        // We'll create exams for Class 1 (id: 1) as an example
        const terms = ['First Installment', 'Second Installment', 'Third Installment'];
        const [subjectRows] = await db.query('SELECT id FROM subjects');

        // Find a class to seed for
        const [classes] = await db.query('SELECT id FROM classes LIMIT 1');
        if (classes.length > 0) {
            const classId = classes[0].id;
            for (const term of terms) {
                for (const subj of subjectRows) {
                    await db.query(`
                        INSERT IGNORE INTO exams (name, class_id, subject_id, exam_date, total_marks) 
                        VALUES (?, ?, ?, CURDATE(), 100)
                    `, [term, classId, subj.id]);
                }
            }
        }

        console.log('✅ Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
