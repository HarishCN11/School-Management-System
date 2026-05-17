const db = require('./config/db');
require('dotenv').config();

async function debugAdmins() {
    try {
        console.log("--- DEBUG ADMINS ---");
        const [existing] = await db.query('SELECT * FROM users WHERE role = "admin" OR role = "Admin"');
        console.log(`Found ${existing.length} admins.`);
        existing.forEach(u => console.log(` - ID: ${u.id}, Email: ${u.email}`));
    } catch (e) {
        console.error("ERROR:", e);
    }
    process.exit(0);
}

debugAdmins();
