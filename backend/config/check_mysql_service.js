const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function checkMySQLStatus() {
    console.log('=== MySQL Service Status Check ===\n');

    try {
        // Check if MySQL service is running
        console.log('Checking MySQL service status...\n');
        const { stdout } = await execPromise('sc query MySQL80', { encoding: 'utf8' });

        if (stdout.includes('RUNNING')) {
            console.log('✅ MySQL80 service is RUNNING\n');
        } else if (stdout.includes('STOPPED')) {
            console.log('⚠️  MySQL80 service is STOPPED\n');
            console.log('Starting MySQL service...');
            try {
                await execPromise('net start MySQL80');
                console.log('✅ MySQL service started successfully\n');
            } catch (e) {
                console.log('❌ Failed to start MySQL service. You may need administrator privileges.\n');
            }
        }
    } catch (error) {
        console.log('Checking for MySQL service (alternative name)...\n');
        try {
            const { stdout } = await execPromise('sc query MySQL', { encoding: 'utf8' });
            if (stdout.includes('RUNNING')) {
                console.log('✅ MySQL service is RUNNING\n');
            }
        } catch (e) {
            console.log('⚠️  Could not find MySQL service. It might be installed with a different name.\n');
        }
    }

    // Try to find MySQL installation
    console.log('Looking for MySQL installation...\n');
    try {
        const { stdout } = await execPromise('where mysql', { encoding: 'utf8' });
        console.log('MySQL executable found at:');
        console.log(stdout);
    } catch (error) {
        console.log('MySQL executable not found in PATH\n');
    }

    // Suggest next steps
    console.log('\n=== Next Steps ===\n');
    console.log('Since we cannot auto-detect the password, please:');
    console.log('1. Open MySQL Workbench');
    console.log('2. Look at your saved connection');
    console.log('3. Right-click → Edit Connection');
    console.log('4. Click "Test Connection"');
    console.log('5. Note the password you enter (or check "Store in Vault")');
    console.log('6. Update the .env file with: DB_PASSWORD=your_password_here\n');

    console.log('Alternatively, you can reset the MySQL root password:');
    console.log('https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html\n');
}

checkMySQLStatus().catch(console.error);
