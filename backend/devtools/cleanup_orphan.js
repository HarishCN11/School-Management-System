const db = require('./config/db');
require('dotenv').config();

async function cleanupOrphans() {
    try {
        const email = 'harishchandranchandru5@gmail.com';
        console.log(`Checking for ${email}...`);

        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            console.log(`Found orphaned user ID: ${users[0].id}. Deleting...`);
            await db.query('DELETE FROM users WHERE id = ?', [users[0].id]);
            console.log("Deleted.");
        } else {
            console.log("No user found.");
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

cleanupOrphans();
