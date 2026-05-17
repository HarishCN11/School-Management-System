const db = require('./config/db');

async function debugUsers() {
  const [users] = await db.query('SELECT id as uid, name, role FROM users');
  for (const u of users) {
    if (u.role === 'student') {
      const [data] = await db.query('SELECT * FROM students WHERE user_id = ?', [u.uid]);
      console.log('STUDENT:', u.name, data[0] || 'NO RECORD');
    } else if (u.role === 'teacher') {
      const [data] = await db.query('SELECT * FROM teachers WHERE user_id = ?', [u.uid]);
      console.log('TEACHER:', u.name, data[0] || 'NO RECORD');
    } else if (u.role === 'principal') {
      const [data] = await db.query('SELECT * FROM principals WHERE user_id = ?', [u.uid]);
      console.log('PRINCIPAL:', u.name, data[0] || 'NO RECORD');
    } else if (u.role === 'parent') {
      const [data] = await db.query('SELECT * FROM parents WHERE user_id = ?', [u.uid]);
      console.log('PARENT:', u.name, data[0] || 'NO RECORD');
    }
  }
  process.exit();
}

debugUsers();
