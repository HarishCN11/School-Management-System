const db = require('./config/db');

async function listUsers() {
    try {
        const connection = await db.getConnection();
        const [rows] = await connection.query('SELECT name, email, role FROM users');
        console.log(JSON.stringify(rows, null, 2));
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listUsers();
