const db = require('./config/db');
const fs = require('fs');

async function check() {
    try {
        const [rows] = await db.query('SELECT name, email, role FROM users');
        fs.writeFileSync('debug_users_output.json', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('debug_users_error.txt', e.stack);
        process.exit(1);
    }
}
check();
