const db = require('./config/db');
require('dotenv').config();

async function fixLink() {
    try {
        const connection = await db.getConnection();
        console.log('Connected.');

        // 1. Get User ID for student1@school.com
        const [users] = await connection.query("SELECT id FROM users WHERE email = 'student1@school.com'");
        if (users.length === 0) {
            console.log("User student1@school.com not found. Creating...");
            // Handle creation if needed, but it should exist based on logs
        }
        const userId = users[0].id;
        console.log('User ID for student1@school.com is:', userId);

        // 2. Check if this user already has a student profile
        const [existing] = await connection.query('SELECT id FROM students WHERE user_id = ?', [userId]);
        if (existing.length > 0) {
            console.log('Student profile already exists for this user. ID:', existing[0].id);
        } else {
            console.log('No profile found. Checking for orphaned profiles or creating new.');

            // Check if there is a profile with admission S101
            const [orphans] = await connection.query("SELECT id FROM students WHERE admission_number = 'S101'");
            if (orphans.length > 0) {
                console.log('Found profile S101 linked to wrong user. Updating...');
                await connection.query('UPDATE students SET user_id = ? WHERE id = ?', [userId, orphans[0].id]);
                console.log('Linked S101 to user', userId);
            } else {
                console.log('Creating new student profile...');
                await connection.query(
                    'INSERT INTO students (user_id, class_id, admission_number, dob, gender, address) VALUES (?, 1, "S101", "2008-01-01", "male", "123 School St")',
                    [userId]
                );
                console.log('Created new profile.');
            }
        }

        connection.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixLink();
