const db = require('./config/db');
async function run() {
  try {
    const [rows] = await db.query('SELECT id, name, email, role FROM users');
    console.log(JSON.stringify(rows));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
