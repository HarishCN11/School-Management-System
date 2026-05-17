const db = require('./config/db');
async function run() {
  try {
    // 1. Get all users with role 'teacher'
    const [teachersUsers] = await db.query('SELECT id, name FROM users WHERE role = "teacher"');
    console.log('Found teachers in users table:', teachersUsers.length);

    for (const u of teachersUsers) {
      // 2. Check if this user has a teacher profile
      const [teacherProfile] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [u.id]);
      
      let teacherId;
      if (teacherProfile.length === 0) {
        // Create teacher profile
        const [result] = await db.query(
          'INSERT INTO teachers (user_id, qualification, specialization, phone_number, address, managed_class_id) VALUES (?, ?, ?, ?, ?, ?)',
          [u.id, 'B.Ed', 'General', '0771112222', 'School Campus', 7]
        );
        teacherId = result.insertId;
        console.log(`Created teacher profile for ${u.name} (User ID: ${u.id}) with Teacher ID: ${teacherId}`);
      } else {
        teacherId = teacherProfile[0].id;
        // Update managed_class_id
        await db.query('UPDATE teachers SET managed_class_id = 7 WHERE id = ?', [teacherId]);
        console.log(`Updated managed_class_id to 7 for ${u.name} (User ID: ${u.id}, Teacher ID: ${teacherId})`);
      }

      // 3. Ensure they have subjects in the schedule for their managed class
      // Delete old schedule to avoid duplication
      await db.query('DELETE FROM schedule WHERE teacher_id = ?', [teacherId]);
      
      // Get all subjects
      const [allSubjects] = await db.query('SELECT id FROM subjects');
      for (const subj of allSubjects) {
        await db.query(
          'INSERT INTO schedule (teacher_id, class_id, subject_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
          [teacherId, 7, subj.id, 'Monday', '08:00:00', '09:00:00']
        );
      }
      console.log(`Linked ${u.name} to Grade 1 and all subjects in schedule.`);
    }

    console.log('--- ALL TEACHERS FIXED ---');
    process.exit(0);
  } catch (err) {
    console.error('Error during global teacher fix:', err);
    process.exit(1);
  }
}
run();
