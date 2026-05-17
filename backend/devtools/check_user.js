const db = require('./config/db');
require('dotenv').config();

async function check() {
    try {
        const [rows] = await db.query("SELECT id, name, email, role FROM users");
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

check();
