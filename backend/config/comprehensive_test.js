const mysql = require('mysql2/promise');
require('dotenv').config();

async function comprehensiveTest() {
    console.log('=== MySQL Connection Comprehensive Test ===\n');

    const passwords = [
        '',           // Empty password
        'root',       // Common default
        'password',   // Common default
        'admin',      // Common default
        '123456',     // Common default
        'mysql',      // Common default
        'toor',       // Reverse of root
    ];

    const dbNames = [
        'school management system',  // User specified
        'school_management',          // Snake case
        'schoolmanagement',           // No spaces
        'school management',          // Partial
    ];

    console.log('Testing connection parameters:');
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`User: root`);
    console.log(`Port: 3306 (default)\n`);

    let successfulConnection = null;

    // First, try to connect without database selection to verify credentials
    console.log('Step 1: Testing authentication (no database selected)...\n');

    for (const pwd of passwords) {
        const displayPwd = pwd === '' ? '(empty)' : pwd;
        process.stdout.write(`  Trying password: ${displayPwd} ... `);

        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: 'root',
                password: pwd,
                port: 3306
            });

            console.log('✅ SUCCESS!');
            successfulConnection = { password: pwd };

            // List all databases
            const [databases] = await connection.execute('SHOW DATABASES');
            console.log('\n  Available databases:');
            databases.forEach(db => {
                console.log(`    - ${db.Database}`);
            });

            await connection.end();
            break;

        } catch (error) {
            if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                console.log('❌ Access denied');
            } else if (error.code === 'ECONNREFUSED') {
                console.log('❌ Connection refused - MySQL not running?');
                console.log('\nMySQL server is not running or not accessible on localhost:3306');
                process.exit(1);
            } else {
                console.log(`❌ ${error.code}: ${error.message}`);
            }
        }
    }

    if (!successfulConnection) {
        console.log('\n❌ Could not authenticate with any common password.');
        console.log('\nPlease check your MySQL Workbench connection settings:');
        console.log('  1. Open MySQL Workbench');
        console.log('  2. Right-click your connection → Edit Connection');
        console.log('  3. Check the password (might be stored in vault)');
        console.log('  4. Provide the correct password\n');
        process.exit(1);
    }

    // Step 2: Try to connect to the specific database
    console.log('\nStep 2: Testing database connection...\n');

    let workingConfig = null;

    for (const dbName of dbNames) {
        process.stdout.write(`  Trying database: "${dbName}" ... `);

        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: 'root',
                password: successfulConnection.password,
                database: dbName,
                port: 3306
            });

            console.log('✅ SUCCESS!');
            workingConfig = {
                password: successfulConnection.password,
                database: dbName
            };

            // Test a simple query
            const [result] = await connection.execute('SELECT DATABASE() as db');
            console.log(`    Connected to: ${result[0].db}`);

            await connection.end();
            break;

        } catch (error) {
            if (error.code === 'ER_BAD_DB_ERROR') {
                console.log('❌ Database does not exist');
            } else {
                console.log(`❌ ${error.code}: ${error.message}`);
            }
        }
    }

    if (workingConfig) {
        console.log('\n✅ CONNECTION SUCCESSFUL!\n');
        console.log('Working configuration:');
        console.log(`  DB_HOST=localhost`);
        console.log(`  DB_USER=root`);
        console.log(`  DB_PASSWORD=${workingConfig.password === '' ? '(empty - leave blank)' : workingConfig.password}`);
        console.log(`  DB_NAME=${workingConfig.database}`);

        console.log('\nUpdating .env file...');

        const fs = require('fs');
        const envPath = require('path').join(__dirname, '..', '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        // Update the values
        envContent = envContent.replace(/DB_PASSWORD=.*$/m, `DB_PASSWORD=${workingConfig.password}`);
        envContent = envContent.replace(/DB_NAME=.*$/m, `DB_NAME=${workingConfig.database}`);

        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file updated successfully!\n');

        console.log('You can now run: npm start');

    } else {
        console.log('\n❌ Could not connect to any database.');
        console.log('The database "school management system" might not exist.');
        console.log('Please create it in MySQL Workbench first.\n');
        process.exit(1);
    }
}

comprehensiveTest().catch(console.error);
