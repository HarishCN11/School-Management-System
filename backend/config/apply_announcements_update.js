const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updateDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        const schemaPath = path.join(__dirname, '../database/update_schema_announcements_role.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await connection.query(schemaSql);
        console.log('Announcements schema updated.');

        await connection.end();
        process.exit(0);
    } catch (error) {
        // If column exists, it throws 'Duplicate column name', which is fine.
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
            process.exit(0);
        }
        console.error('Error updating database:', error);
        process.exit(1);
    }
}

updateDB();
