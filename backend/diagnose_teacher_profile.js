const db = require('./config/db');
async function run() {
  try {
    const [rows] = await db.query(`
      SELECT u.id as user_id, u.name, u.email, u.role,
             t.id as teacher_id, t.qualification, t.specialization, t.phone_number, t.address, t.managed_class_id,
             c.name as class_name
      FROM users u
      LEFT JOIN teachers t ON t.user_id = u.id
      LEFT JOIN classes c ON t.managed_class_id = c.id
      WHERE u.role = 'teacher'
    `);
    rows.forEach(r => {
      console.log('---');
      console.log('user_id:', r.user_id, 'name:', r.name);
      console.log('teacher_id:', r.teacher_id);
      console.log('qualification:', r.qualification);
      console.log('specialization:', r.specialization);
      console.log('phone_number:', r.phone_number);
      console.log('address:', r.address);
      console.log('managed_class_id:', r.managed_class_id, '=> class:', r.class_name);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
