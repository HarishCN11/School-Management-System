const db = require('./config/db');
async function run() {
  try {
    const [rows] = await db.query(`
      SELECT u.id as user_id, u.name, u.role, t.id as teacher_id, t.managed_class_id 
      FROM users u 
      LEFT JOIN teachers t ON u.id = t.user_id
    `);
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
