const db = require('./config/db');
async function run() {
  try {
    // 1. Get Teacher1's user_id
    const [users] = await db.query('SELECT id FROM users WHERE name = "Teacher1" LIMIT 1');
    if (users.length === 0) {
      console.log('Teacher1 not found in users table');
      process.exit(1);
    }
    const userId = users[0].id;

    // 2. Check if Teacher1 is in teachers table
    const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [userId]);
    let teacherId;
    if (teachers.length === 0) {
      // Insert into teachers table
      const [result] = await db.query(
        'INSERT INTO teachers (user_id, specialization, experience, educational_qualifications, address, managed_class_id) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, 'General', '5 Years', 'B.Ed', 'School Campus', 7] // Grade 1
      );
      teacherId = result.insertId;
      console.log('Inserted Teacher1 into teachers table with ID:', teacherId);
    } else {
      teacherId = teachers[0].id;
      // Update managed_class_id just in case
      await db.query('UPDATE teachers SET managed_class_id = 7 WHERE id = ?', [teacherId]);
      console.log('Updated Teacher1 managed_class_id to 7. Teacher ID:', teacherId);
    }

    // 3. Clear existing schedule for this teacher to prevent duplicates
    await db.query('DELETE FROM schedule WHERE teacher_id = ?', [teacherId]);

    // 4. Link Teacher1 to all Grade 1 subjects in schedule
    const [grade1Subjects] = await db.query('SELECT id FROM subjects'); // For now, giving all subjects
    for (const subject of grade1Subjects) {
      await db.query(
        'INSERT INTO schedule (teacher_id, class_id, subject_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
        [teacherId, 7, subject.id, 'Monday', '08:00:00', '09:00:00']
      );
    }

    console.log('Successfully linked Teacher1 to Grade 1 and all subjects in schedule.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
