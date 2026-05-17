const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function updateDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        const schemaPath = path.join(__dirname, '../database/update_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running update schema...');

        // Split and execute like init_db.js
        const statements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);

        for (const statement of statements) {
            await connection.query(statement);
            console.log('Executed statement.');
        }

        console.log('Database updated successfully.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error updating database:', error);
        process.exit(1);
    }
}

updateDB();
