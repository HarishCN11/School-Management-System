const db = require('./config/db');
async function run() {
  try {
    const [rows] = await db.query('SELECT id, name, email FROM users WHERE role = "teacher"');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
