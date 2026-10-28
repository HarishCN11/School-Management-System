const db = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUser() {
    try {
        const connection = await db.getConnection();
        console.log('Connected.');

        const email = 'teststudent@school.com';
        const password = 'Password@123';
        const name = 'Test Student';

        console.log(`Creating test user: ${email} / ${password}`);

        // 1. Create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await connection.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
            [name, email, hashedPassword, 'student', hashedPassword]
        );

        // Get User ID
        const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        const userId = users[0].id;

        // 2. Create Student Profile
        await connection.query(
            'INSERT INTO students (user_id, class_id, admission_number, dob, address) VALUES (?, 1, "TEST001", "2010-01-01", "Test Address") ON DUPLICATE KEY UPDATE address="Test Address"',
            [userId]
        );

        console.log('Test user created and linked successfully.');
        connection.release();
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

createTestUser();
