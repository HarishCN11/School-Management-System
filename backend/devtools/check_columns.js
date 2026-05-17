const db = require('./config/db');

async function checkSchema() {
    try {
        const [tables] = await db.query('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]));

        for (const table of ['assignments', 'study_materials', 'inventory', 'teachers', 'feedback', 'inventory_allocations']) {
            try {
                const [cols] = await db.query(`DESCRIBE ${table}`);
                console.log(`--- Table: ${table} ---`);
                cols.forEach(c => {
                    console.log(`  ${c.Field} (${c.Type}) - Default: ${c.Default}, Key: ${c.Key}`);
                });
            } catch (e) {
                console.log(`Table ${table} does not exist yet.`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
