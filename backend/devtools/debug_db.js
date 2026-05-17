const db = require('./config/db');
require('dotenv').config();

async function diagnose() {
    try {
        const connection = await db.getConnection();
        console.log('Connected.');

        // 1. List all users
        console.log('\n--- USERS ---');
        const [users] = await connection.query('SELECT id, name, email, role FROM users');
        console.table(users);

        // 2. List all students
        console.log('\n--- STUDENTS ---');
        const [students] = await connection.query('SELECT id, user_id, admission_number FROM students');
        console.table(students);

        // 3. Check join
        console.log('\n--- JOIN CHECK (email="student1@school.com") ---');
        const [join] = await connection.query(`
            SELECT u.email, u.name, u.role, s.id as student_id, s.admission_number 
            FROM users u 
            LEFT JOIN students s ON u.id = s.user_id 
            WHERE u.email = "student1@school.com"
        `);
        console.table(join);

        connection.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

diagnose();
