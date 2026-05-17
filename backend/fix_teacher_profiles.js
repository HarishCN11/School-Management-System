const db = require('./config/db');
async function run() {
  try {
    // Ensure all teacher profiles have proper qualification and specialization
    // Update entries where these fields are null or generic
    const [result] = await db.query(`
      UPDATE teachers 
      SET 
        qualification = COALESCE(NULLIF(qualification, ''), 'B.Ed'),
        specialization = COALESCE(NULLIF(specialization, ''), 'Class Teacher')
      WHERE qualification IS NULL OR qualification = '' OR specialization IS NULL OR specialization = ''
    `);
    console.log('Updated teachers with missing qualification/specialization:', result.affectedRows);
    
    // Show final state
    const [rows] = await db.query(`
      SELECT u.id, u.name, t.qualification, t.specialization, t.phone_number, t.address, t.managed_class_id
      FROM users u JOIN teachers t ON t.user_id = u.id WHERE u.role = 'teacher'
    `);
    rows.forEach(r => console.log(r.name, '| qual:', r.qualification, '| spec:', r.specialization, '| phone:', r.phone_number, '| class:', r.managed_class_id));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
