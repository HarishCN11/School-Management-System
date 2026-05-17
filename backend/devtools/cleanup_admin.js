const db = require('./config/db');
require('dotenv').config();

async function clean() {
    try {
        console.log("Deleting old admin user 'admin@school.com' to avoid conflicts...");
        const [result] = await db.query("DELETE FROM users WHERE email = 'admin@school.com'");
        console.log(`Deleted ${result.affectedRows} users.`);
    } catch (err) {
        console.error("Error deleting user:", err);
    } finally {
        process.exit(0);
    }
}

clean();
