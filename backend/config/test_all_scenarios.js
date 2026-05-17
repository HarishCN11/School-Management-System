const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAllScenarios() {
    console.log('🔍 Testing All Possible MySQL Connection Scenarios\n');
    console.log('═'.repeat(70));

    const scenarios = [
        { desc: 'Empty password (undefined)', password: undefined },
        { desc: 'Empty password (empty string)', password: '' },
        { desc: 'Empty password (null)', password: null },
        { desc: 'No password property', password: 'SKIP' },
    ];

    for (const scenario of scenarios) {
        console.log(`\n📌 Testing: ${scenario.desc}`);
        console.log('─'.repeat(70));

        try {
            const config = {
                host: 'localhost',
                user: 'root',
                port: 3306
            };

            if (scenario.password !== 'SKIP') {
                config.password = scenario.password;
            }

            console.log('   Config:', JSON.stringify(config, null, 2).replace(/\n/g, '\n   '));

            const connection = await mysql.createConnection(config);

            console.log('   ✅ SUCCESS! This configuration works!\n');

            // List databases
            const [databases] = await connection.execute('SHOW DATABASES');
            console.log('   📁 Available databases:');
            databases.forEach(db => {
                console.log(`      - ${db.Database}`);
            });

            await connection.end();

            console.log('\n╔════════════════════════════════════════════════════════════════╗');
            console.log('║                  ✅ WORKING CONFIGURATION FOUND!                ║');
            console.log('╚════════════════════════════════════════════════════════════════╝\n');
            console.log('Update your .env file to use this configuration.\n');

            return true;

        } catch (error) {
            console.log(`   ❌ Failed: ${error.code} - ${error.message}`);
        }
    }

    console.log('\n═'.repeat(70));
    console.log('\n❌ None of the empty password scenarios worked.\n');
    console.log('This means MySQL root user DEFINITELY has a password set.\n');
    console.log('🔍 Let me check if there are other users available...\n');

    // Try to find MySQL config files
    const fs = require('fs');
    const path = require('path');

    const possibleConfigPaths = [
        'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\my.ini',
        'C:\\ProgramData\\MySQL\\MySQL Server 8.4\\my.ini',
        'C:\\Program Files\\MySQL\\MySQL Server 8.0\\my.ini',
        'C:\\Program Files\\MySQL\\MySQL Server 8.4\\my.ini',
        'C:\\xampp\\mysql\\bin\\my.ini',
    ];

    console.log('📄 Checking for MySQL configuration files...\n');
    for (const configPath of possibleConfigPaths) {
        if (fs.existsSync(configPath)) {
            console.log(`   ✅ Found: ${configPath}`);
        }
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    🔐 PASSWORD IS REQUIRED                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log('Please try one of these options:\n');
    console.log('1️⃣  Check MySQL Workbench connection settings');
    console.log('   - Open MySQL Workbench');
    console.log('   - Right-click connection → Edit Connection');
    console.log('   - Click "Store in Vault" to see saved password\n');
    console.log('2️⃣  Try connecting via command line to verify:');
    console.log('   mysql -u root -p');
    console.log('   (it will prompt for password - try pressing Enter for empty)\n');
    console.log('3️⃣  Create a new MySQL user with a known password:');
    console.log('   - Connect via MySQL Workbench');
    console.log('   - Run: CREATE USER \'school_admin\'@\'localhost\' IDENTIFIED BY \'School123\';');
    console.log('   - Run: GRANT ALL PRIVILEGES ON `school management system`.* TO \'school_admin\'@\'localhost\';');
    console.log('   - Update .env: DB_USER=school_admin, DB_PASSWORD=School123\n');

    return false;
}

testAllScenarios().catch(console.error);
