const db = require('./config/db');
require('dotenv').config();

async function seedAnnouncements() {
    try {
        const connection = await db.getConnection();

        console.log('Finding valid poster...');
        // Find a valid poster (Admin or Teacher)
        const [users] = await connection.query('SELECT id FROM users WHERE role IN ("Admin", "Teacher") LIMIT 1');
        let posterId = 1;
        if (users.length > 0) {
            posterId = users[0].id;
            console.log('Using Poster ID:', posterId);
        } else {
            // Fallback
            const [anyUser] = await connection.query('SELECT id FROM users LIMIT 1');
            if (anyUser.length > 0) posterId = anyUser[0].id;
            console.log('Fallback Poster ID:', posterId);
        }

        console.log('Seeding announcements...');
        const announcements = [
            {
                title: 'Welcome to the New Term',
                content: 'We are excited to welcome all students back for the new academic term. Please check your course schedules.',
                posted_by: posterId,
                role_target: 'Student'
            },
            {
                title: 'Exam Schedule Released',
                content: 'The Term 1 exam schedule has been released. Check under Reports for more details.',
                posted_by: posterId,
                role_target: 'Student'
            },
            {
                title: 'Library Hours Extended',
                content: 'The school library will remain open until 5 PM starting next week.',
                posted_by: posterId,
                role_target: 'All'
            }
        ];

        for (const ann of announcements) {
            try {
                // Ensure foreign key constraints are met. If posterId is invalid, this will fail.
                await connection.query(
                    'INSERT INTO announcements (title, content, posted_by, role_target, created_at) VALUES (?, ?, ?, ?, NOW())',
                    [ann.title, ann.content, ann.posted_by, ann.role_target]
                );
            } catch (err) {
                console.log('Skipping duplicate or error:', err.message);
            }
        }

        console.log('Announcements seeded.');
        connection.release();
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seedAnnouncements();
