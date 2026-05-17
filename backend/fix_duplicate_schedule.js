const db = require('./config/db');
async function run() {
  try {
    // Get all teacher IDs
    const [teachers] = await db.query('SELECT id FROM teachers');
    
    for (const t of teachers) {
      // Get all schedule entries for this teacher, group by subject+class to find duplicates
      const [entries] = await db.query(
        'SELECT id, subject_id, class_id FROM schedule WHERE teacher_id = ? ORDER BY id ASC',
        [t.id]
      );
      
      const seen = new Set();
      const duplicateIds = [];
      
      for (const entry of entries) {
        const key = `${entry.subject_id}-${entry.class_id}`;
        if (seen.has(key)) {
          duplicateIds.push(entry.id);
        } else {
          seen.add(key);
        }
      }
      
      if (duplicateIds.length > 0) {
        await db.query(`DELETE FROM schedule WHERE id IN (${duplicateIds.join(',')})`);
        console.log(`Removed ${duplicateIds.length} duplicate schedule entries for teacher ID ${t.id}`);
      } else {
        console.log(`No duplicates found for teacher ID ${t.id}`);
      }
    }
    
    console.log('Done cleaning schedule table.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
