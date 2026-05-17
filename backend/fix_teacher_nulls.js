const db = require('./config/db');
async function run() {
  try {
    // Show ALL teachers with full data
    const [rows] = await db.query(`
      SELECT u.id as user_id, u.name, 
             t.id as teacher_id, t.qualification, t.specialization, t.phone_number, t.address, t.managed_class_id
      FROM users u 
      LEFT JOIN teachers t ON t.user_id = u.id 
      WHERE u.role = 'teacher'
      ORDER BY u.id
    `);
    
    console.log('=== TEACHER PROFILES ===');
    for (const r of rows) {
      console.log(`User: ${r.user_id} | Name: ${r.name} | TeacherID: ${r.teacher_id} | Qual: "${r.qualification}" | Spec: "${r.specialization}" | Phone: "${r.phone_number}" | Class: ${r.managed_class_id}`);
      
      // Fix: if qualification or specialization is null/empty, update with defaults
      if (!r.teacher_id) {
        console.log(`  -> No teacher profile found for ${r.name}, creating one...`);
        await db.query(
          'INSERT INTO teachers (user_id, qualification, specialization, phone_number, address, managed_class_id) VALUES (?, ?, ?, ?, ?, ?)',
          [r.user_id, 'B.Ed', 'Class Teacher', '', '', null]
        );
      } else if (!r.qualification || r.qualification.trim() === '') {
        await db.query('UPDATE teachers SET qualification = ? WHERE id = ?', ['B.Ed', r.teacher_id]);
        console.log(`  -> Set qualification to B.Ed for ${r.name}`);
      }
      if (r.teacher_id && (!r.specialization || r.specialization.trim() === '')) {
        await db.query('UPDATE teachers SET specialization = ? WHERE id = ?', ['Class Teacher', r.teacher_id]);
        console.log(`  -> Set specialization to Class Teacher for ${r.name}`);
      }
    }
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
run();
