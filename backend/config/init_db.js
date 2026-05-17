const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initDB() {
    try {
        // Create connection without selecting database first to create it if needed
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            connectionLimit: 1
        });

        console.log('Connected to MySQL server.');

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon to execute statements one by one
        // Note: This is a simple split, might break on complex SQL with semicolons in strings suitable for a basic schema
        const statements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);

        // Disable foreign key checks for initialization
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

        for (const statement of statements) {
            await connection.query(statement);
            console.log('Executed statement.');
        }

        // Enable foreign key checks back
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('Database initialized successfully.');
        await connection.end();
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initDB();
