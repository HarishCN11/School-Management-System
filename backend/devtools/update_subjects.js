const db = require('./config/db');
require('dotenv').config();

async function updateSubjects() {
    try {
        const connection = await db.getConnection();
        console.log('Connected to DB.');

        // 1. Clear existing subjects (careful if foreign keys exist, but for dev it works if we handle it or just update names)
        // Better to Update/Insert specific IDs to ensure stability if possible, or just truncate and re-seed if we are in dev mode.
        // Given we are maintaining data, let's just Rename existing ones or Insert if not exist.

        const subjects = ['Tamil', 'English', 'Sinhala', 'Maths', 'Environment'];

        // Let's wipe and recreate for clean slate if that's safer for "renaming" purely, 
        // BUT we have exams linked to subject_ids. So updating names is better than deleting.

        // Fetch existing
        const [existing] = await connection.query('SELECT id, name FROM subjects ORDER BY id');

        for (let i = 0; i < subjects.length; i++) {
            if (i < existing.length) {
                // Update
                await connection.query('UPDATE subjects SET name = ? WHERE id = ?', [subjects[i], existing[i].id]);
                console.log(`Updated subject ${existing[i].id} to ${subjects[i]}`);
            } else {
                // Insert
                await connection.query('INSERT INTO subjects (name, code) VALUES (?, ?)', [subjects[i], subjects[i].substring(0, 3).toUpperCase()]);
                console.log(`Inserted new subject ${subjects[i]}`);
            }
        }

        // If there were more existing than new list, we could delete extra, but maybe keep them for safety.

        connection.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

updateSubjects();
