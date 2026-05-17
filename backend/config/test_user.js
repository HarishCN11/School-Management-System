const mysql = require('mysql2/promise');
require('dotenv').config();

async function testUser() {
    const user = 'school_admin';
    const port = 3306;
    const password = '';

    try {
        console.log(`Checking user ${user} on port ${port}...`);
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: port,
            user: user,
            password: password,
            connectTimeout: 2000
        });
        console.log(`[SUCCESS] User ${user} login SUCCESSFUL!`);
        await connection.end();
    } catch (err) {
        console.log(`[FAILED] User ${user}: ${err.message}`);
    }
}

testUser().catch(console.error);
