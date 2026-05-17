const db = require('./config/db');

async function check() {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE role="student"');
        console.log("USERS:", users);
        const [students] = await db.query('SELECT * FROM students');
        console.log("STUDENTS:", students);
        process.exit();
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
