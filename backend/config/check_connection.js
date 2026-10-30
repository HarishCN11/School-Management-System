const db = require('./db');

async function checkConnection() {
    let connection;

    try {
        connection = await db.getConnection();
        await connection.query('SELECT 1');
        console.log('Supabase PostgreSQL connection successful.');
    } finally {
        connection?.release();
    }
}

checkConnection().catch(error => {
    console.error('Supabase PostgreSQL connection failed:', error.message);
    process.exitCode = 1;
});
