const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding managed_class_id to teachers table...');
        try {
            await db.query('ALTER TABLE teachers ADD COLUMN managed_class_id INT DEFAULT NULL');
            await db.query('ALTER TABLE teachers ADD FOREIGN KEY (managed_class_id) REFERENCES classes(id) ON DELETE SET NULL');
            console.log('✓ Successfully added managed_class_id');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') console.log('managed_class_id already exists');
            else throw err;
        }

        console.log('Creating official_reports table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS official_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                subject_id INT NOT NULL,
                term_1_marks VARCHAR(10) DEFAULT '-',
                term_2_marks VARCHAR(10) DEFAULT '-',
                term_3_marks VARCHAR(10) DEFAULT '-',
                academic_year VARCHAR(20) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY student_subject (student_id, subject_id, academic_year),
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Successfully created official_reports table');

        console.log('Adding student_id to feedback table for direct messaging if not exists...');
        try {
            await db.query('ALTER TABLE feedback ADD COLUMN student_id INT DEFAULT NULL');
            await db.query('ALTER TABLE feedback ADD FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL');
            console.log('✓ Added student_id to feedback');
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') console.log('student_id in feedback already exists');
        }

    } catch (error) {
        console.error('Migration error:', error);
    }
    process.exit();
}

migrate();
