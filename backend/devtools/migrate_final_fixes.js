const db = require('./config/db');

async function migrate() {
    try {
        console.log('Running migrations...');

        // 1. Add class_id to announcements
        try {
            await db.query('ALTER TABLE announcements ADD COLUMN class_id INT NULL');
            await db.query('ALTER TABLE announcements ADD CONSTRAINT fk_ann_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL');
            console.log('✅ Added class_id to announcements');
        } catch (e) {
            console.log('ℹ️ class_id might already exist in announcements');
        }

        // 2. Ensure assignments table exists (if not already)
        await db.query(`
            CREATE TABLE IF NOT EXISTS assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                class_id INT NOT NULL,
                subject_id INT NOT NULL,
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (subject_id) REFERENCES subjects(id)
            )
        `);
        console.log('✅ Assignments table checked');

        // 3. Ensure submissions table exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                marks INT,
                remarks TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Submissions table checked');

        // 4. Ensure materials table exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                class_id INT NOT NULL,
                subject_id INT NOT NULL,
                teacher_id INT NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (subject_id) REFERENCES subjects(id),
                FOREIGN KEY (teacher_id) REFERENCES teachers(id)
            )
        `);
        console.log('✅ Materials table checked');

        console.log('Migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
