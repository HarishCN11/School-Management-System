const db = require('./config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createTestTeacher() {
    try {
        const connection = await db.getConnection();

        const email = 'teacher@school.com';
        const password = 'Password@123';
        const name = 'Test Teacher';

        // 1. Create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await connection.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
            [name, email, hashedPassword, 'Teacher', hashedPassword]
        );

        // Get User ID
        const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        const userId = users[0].id;

        // 2. Create Teacher Profile
        // Check if exists first to avoid duplicate errors if constraints are unique
        await connection.query(
            'INSERT INTO teachers (user_id, specialization, qualification) VALUES (?, "Mathematics", "M.Sc B.Ed") ON DUPLICATE KEY UPDATE specialization="Mathematics"',
            [userId]
        );

        console.log(`Test Teacher created: ${email} / ${password}`);
        connection.release();
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

createTestTeacher();
