const db = require('./config/db');

async function migrate() {
    try {
        console.log('Running migration: Add file_path to assignments...');
        await db.query('ALTER TABLE assignments ADD COLUMN file_path VARCHAR(255) NULL');
        console.log('✅ Added file_path to assignments');
        process.exit(0);
    } catch (error) {
        console.log('ℹ️ file_path might already exist in assignments');
        process.exit(0);
    }
}

migrate();
