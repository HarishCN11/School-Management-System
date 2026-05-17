const db = require('./config/db');
require('dotenv').config();

async function diagnose() {
    try {
        const connection = await db.getConnection();
        console.log('Connected.');

        console.log('--- USERS ---');
        const [users] = await connection.query('SELECT id, name, email, role FROM users');
        console.log(JSON.stringify(users, null, 2));

        console.log('--- STUDENTS ---');
        const [students] = await connection.query('SELECT id, user_id, admission_number FROM students');
        console.log(JSON.stringify(students, null, 2));

        console.log('--- JOIN CHECK (email="student1@school.com") ---');
        const [join] = await connection.query(`
            SELECT u.email, u.name, u.role, s.id as student_id, s.admission_number 
            FROM users u 
            LEFT JOIN students s ON u.id = s.user_id 
            WHERE u.email = "student1@school.com"
        `);
        console.log(JSON.stringify(join, null, 2));

        connection.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

diagnose();
