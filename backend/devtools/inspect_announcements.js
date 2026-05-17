const db = require('./config/db');
require('dotenv').config();

async function inspectAnnouncements() {
    try {
        const connection = await db.getConnection();
        const [columns] = await connection.query('SHOW COLUMNS FROM announcements');
        console.log(columns);
        connection.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

inspectAnnouncements();
