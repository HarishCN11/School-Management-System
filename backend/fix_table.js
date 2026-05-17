const db = require('./config/db');

async function fixTable() {
    try {
        await db.query('DROP TABLE IF EXISTS student_feedback');
        await db.query(`
            CREATE TABLE student_feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                teacher_id INT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
            )
        `);
        console.log('Fixed student_feedback table to use user_id');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
fixTable();
