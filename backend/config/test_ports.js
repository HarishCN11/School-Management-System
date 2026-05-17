const mysql = require('mysql2/promise');
require('dotenv').config();

async function testPorts() {
    const ports = [3306, 3307];
    const user = 'root';
    const password = '';

    console.log(`Starting test for user: ${user} on localhost...`);

    for (const port of ports) {
        try {
            console.log(`Checking port ${port}...`);
            const connection = await mysql.createConnection({
                host: '127.0.0.1', // Use IP to avoid localhost resolution issues
                port: port,
                user: user,
                password: password,
                connectTimeout: 2000 // 2 seconds timeout
            });
            console.log(`[SUCCESS] Port ${port} is OPEN and login SUCCESSFUL!`);

            const [rows] = await connection.execute('SHOW DATABASES');
            console.log('Available Databases:', rows.map(r => r.Database).join(', '));

            await connection.end();
        } catch (err) {
            console.log(`[FAILED] Port ${port}: ${err.message}`);
        }
    }
    console.log('--- Test Finished ---');
}

testPorts().catch(console.error);
