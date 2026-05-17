const db = require('./db');
require('dotenv').config();

async function checkConnection() {
    console.log('Testing MySQL database connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);

    try {
        const connection = await db.getConnection();
        console.log('✅ Connection successful!');
        await connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error(`Error Code: ${error.code}`);
        console.error(`Message: ${error.message}`);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\nHint: Please check your DB_USER and DB_PASSWORD in the .env file.');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\nHint: Is your MySQL server running? Check the host and port.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log(`\nHint: The database "${process.env.DB_NAME}" does not exist. Please create it manually or run your initialization script.`);
        }

        process.exit(1);
    }
}

checkConnection();
