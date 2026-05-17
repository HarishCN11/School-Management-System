const db = require('./config/db');
require('dotenv').config();

async function cleanup() {
    try {
        const emails = ['harishchandran2001@gmail.com', 'harishchandranchandru5@gmail.com'];
        console.log(`Deleting ${emails.join(', ')}...`);

        const [result] = await db.query('DELETE FROM users WHERE email IN (?, ?)', emails);
        console.log(`Deleted ${result.affectedRows} users.`);

        console.log("Cleanup Complete. These emails are now free to register.");
    } catch (e) {
        console.error("Cleanup Error:", e);
    }
    process.exit(0);
}

cleanup();
