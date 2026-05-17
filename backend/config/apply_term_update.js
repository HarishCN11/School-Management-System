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

        const schemaPath = path.join(__dirname, '../database/update_schema_terms.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon and execute non-empty statements
        const statements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);

        for (const statement of statements) {
            try {
                await connection.query(statement);
                console.log('Executed statement.');
            } catch (err) {
                // Ignore "Duplicate column name" error if it already exists
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column already exists, skipping.');
                } else {
                    console.error('Error executing statement:', err.message);
                }
            }
        }

        console.log('Database schema updated for Terms.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error updating database:', error);
        process.exit(1);
    }
}

updateDB();
