const db = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkLogin() {
    try {
        const connection = await db.getConnection();
        const email = 'student1@school.com';
        const password = 'School@2026!';

        console.log(`Checking login for ${email} with password ${password}`);

        const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            console.log('User not found!');
        } else {
            console.log('User found:', users[0]);
            const match = await bcrypt.compare(password, users[0].password_hash);
            console.log('Password match:', match);
        }

        connection.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkLogin();
