console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     SCHOOL MANAGEMENT BACKEND - CONNECTION DIAGNOSTIC          ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('📋 Current Configuration (.env file):');
console.log('─'.repeat(60));
console.log(`   DB_HOST     : ${process.env.DB_HOST || '(not set)'}`);
console.log(`   DB_USER     : ${process.env.DB_USER || '(not set)'}`);
console.log(`   DB_PASSWORD : ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-2) : '(empty)'}`);
console.log(`   DB_NAME     : ${process.env.DB_NAME || '(not set)'}`);
console.log(`   PORT        : ${process.env.PORT || '(not set)'}`);
console.log('');

async function testConnection() {
    console.log('🔍 Testing MySQL Connection...\n');

    try {
        console.log('   Attempting to connect to MySQL server...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: 3306
        });

        console.log('   ✅ Successfully authenticated with MySQL!\n');

        // Get list of databases
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('📁 Available Databases:');
        console.log('─'.repeat(60));
        databases.forEach(db => {
            const marker = db.Database === process.env.DB_NAME ? ' ← TARGET' : '';
            console.log(`   ${db.Database}${marker}`);
        });
        console.log('');

        // Check if target database exists
        const targetExists = databases.some(db => db.Database === process.env.DB_NAME);

        if (targetExists) {
            console.log(`✅ Target database "${process.env.DB_NAME}" EXISTS\n`);

            // Try to connect to the specific database
            await connection.changeUser({ database: process.env.DB_NAME });
            console.log('✅ Successfully connected to target database\n');

            // Get tables in the database
            const [tables] = await connection.execute('SHOW TABLES');
            if (tables.length > 0) {
                console.log('📊 Tables in database:');
                console.log('─'.repeat(60));
                tables.forEach(table => {
                    const tableName = Object.values(table)[0];
                    console.log(`   ${tableName}`);
                });
                console.log('');
            } else {
                console.log('⚠️  Database exists but contains NO TABLES\n');
                console.log('   You may need to run: node config/init_db.js\n');
            }

        } else {
            console.log(`❌ Target database "${process.env.DB_NAME}" DOES NOT EXIST\n`);
            console.log('   Possible matches:');
            const similar = databases.filter(db =>
                db.Database.toLowerCase().includes('school')
            );
            if (similar.length > 0) {
                similar.forEach(db => console.log(`   - ${db.Database}`));
            } else {
                console.log('   (no databases with "school" in the name found)');
            }
            console.log('');
        }

        await connection.end();

        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║                    ✅ DIAGNOSIS COMPLETE                        ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        if (targetExists) {
            console.log('✨ Your configuration is CORRECT! You can now run:\n');
            console.log('   npm start\n');
        } else {
            console.log('⚠️  ACTION REQUIRED:\n');
            console.log('   1. Update DB_NAME in .env to match an existing database, OR');
            console.log('   2. Create the database in MySQL Workbench\n');
        }

        process.exit(0);

    } catch (error) {
        console.log('❌ Connection FAILED\n');
        console.log('Error Details:');
        console.log('─'.repeat(60));
        console.log(`   Code    : ${error.code}`);
        console.log(`   Message : ${error.message}`);
        console.log('');

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('╔════════════════════════════════════════════════════════════════╗');
            console.log('║              🔐 AUTHENTICATION FAILED                          ║');
            console.log('╚════════════════════════════════════════════════════════════════╝\n');
            console.log('The MySQL server rejected your credentials.\n');
            console.log('📝 TO FIX THIS:\n');
            console.log('1. Open MySQL Workbench');
            console.log('2. Right-click your connection → "Edit Connection"');
            console.log('3. Click "Test Connection" to verify it works');
            console.log('4. Check the password (click "Store in Vault" to see it)');
            console.log('5. Update .env file with the correct password:\n');
            console.log('   DB_PASSWORD=your_actual_password\n');
            console.log('6. Run this diagnostic again: node config/final_diagnostic.js\n');

        } else if (error.code === 'ECONNREFUSED') {
            console.log('╔════════════════════════════════════════════════════════════════╗');
            console.log('║              🚫 MYSQL SERVER NOT RUNNING                       ║');
            console.log('╚════════════════════════════════════════════════════════════════╝\n');
            console.log('MySQL server is not accessible.\n');
            console.log('📝 TO FIX THIS:\n');
            console.log('1. Open MySQL Workbench');
            console.log('2. Try to connect - it should start the server');
            console.log('3. Or manually start MySQL service from Windows Services\n');

        } else {
            console.log('📝 Unexpected error. Please check:\n');
            console.log('1. MySQL is installed and running');
            console.log('2. Your .env configuration is correct');
            console.log('3. You can connect via MySQL Workbench\n');
        }

        process.exit(1);
    }
}

testConnection();
