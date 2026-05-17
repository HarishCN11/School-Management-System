const db = require('./config/db');
require('dotenv').config();

async function checkEmails() {
    try {
        const emailsToCheck = ['harishchandran2001@gmail.com', 'harishchandranchandru5@gmail.com'];
        console.log(`Checking for emails: ${emailsToCheck.join(', ')}`);

        // Using parameter substitution for safety, though technically internal script
        const [rows] = await db.query(
            `SELECT id, name, email, role FROM users WHERE email IN (?, ?)`,
            emailsToCheck
        );

        console.log("Found users:");
        console.log(JSON.stringify(rows, null, 2));

        if (rows.length > 0) {
            console.log("\nCONCLUSION: The emails likely fail to register because they ALREADY EXIST in the database.");
        } else {
            console.log("\nCONCLUSION: These emails are NOT in the database. Failure must be due to validation or server error.");
        }

    } catch (e) {
        console.error("Database Error:", e);
    }
    process.exit(0);
}

checkEmails();
