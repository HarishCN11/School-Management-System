const pool = require('./config/db');

async function test() {
    console.log('--- Database Diagnostic ---');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);

    try {
        console.log('Attempting to get connection...');
        const conn = await pool.getConnection();
        console.log('✅ Success! Database is reachable.');
        conn.release();
    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
    }
    process.exit(0);
}

test();
