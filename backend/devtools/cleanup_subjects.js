const db = require('./config/db');

async function cleanup() {
    try {
        console.log('Starting subject cleanup (Safe Mode)...');

        // IDs we want to remove
        const redundantIds = [1, 7, 4, 5, 6];

        // Move data from redundant to correct ones
        // 5 (Maths) -> 20 (Mathematics)
        // 4 (Sinhala) -> 23 (Sinhala)
        // 6 (Environment) -> 21 (Environmental Activities)
        // 1, 7 (Tamil) -> 19 (1st Language / Tamil)

        const mappings = [
            { from: 5, to: 20 },
            { from: 4, to: 23 },
            { from: 6, to: 21 },
            { from: 1, to: 19 },
            { from: 7, to: 19 }
        ];

        for (const mapping of mappings) {
            console.log(`Mapping ${mapping.from} to ${mapping.to}...`);
            await db.query('UPDATE exams SET subject_id = ? WHERE subject_id = ?', [mapping.to, mapping.from]).catch(() => { });
            await db.query('UPDATE schedule SET subject_id = ? WHERE subject_id = ?', [mapping.to, mapping.from]).catch(() => { });
            await db.query('UPDATE assignments SET subject_id = ? WHERE subject_id = ?', [mapping.to, mapping.from]).catch(() => { });
            await db.query('UPDATE study_materials SET subject_id = ? WHERE subject_id = ?', [mapping.to, mapping.from]).catch(() => { });
        }

        // Now delete the redundant subjects
        for (const id of redundantIds) {
            await db.query('DELETE FROM subjects WHERE id = ?', [id]).catch((e) => console.log(`Could not delete ${id}: ${e.message}`));
        }

        // Now rename 19 to Tamil
        await db.query('UPDATE subjects SET name = "Tamil", code = "TAM" WHERE id = 19');
        console.log('✅ Final Subject: 1st Language -> Tamil');

        console.log('✅ Subject cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
