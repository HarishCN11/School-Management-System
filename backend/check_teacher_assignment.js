const db = require('./config/db');
async function run() {
  try {
    const [rows] = await db.query('SELECT u.id as user_id, u.name, u.email, t.id as teacher_id, t.managed_class_id FROM users u LEFT JOIN teachers t ON t.user_id = u.id WHERE u.role = "teacher"');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
