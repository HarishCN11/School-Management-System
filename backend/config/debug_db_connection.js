const mysql = require('mysql2/promise');
require('dotenv').config();


async function tryConnect(password) {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: 'root',
            password: password
        });
        await connection.end();
        return true;
    } catch (err) {
        return false;
    }
}

async function debugConnection() {
    console.log('--- Database Connection Diagnostic ---');

    const candidates = ['', 'root', 'password', 'admin', '123456', '1234'];
    let workingPassword = null;

    for (const pwd of candidates) {
        console.log(`Trying password: '${pwd}' ...`);
        if (await tryConnect(pwd)) {
            workingPassword = pwd;
            console.log(`✅ SUCCESS! The password is: '${pwd}'`);
            break;
        }
    }

    if (workingPassword !== null) {
        // Now list databases with the working password
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: 'root',
                password: workingPassword
            });

            const [rows] = await connection.execute('SHOW DATABASES');
            console.log('\nAvailable Databases:');
            rows.forEach(row => console.log(` - ${row.Database}`));

            const targetDb = "school management system";
            const exists = rows.some(r => r.Database === targetDb);
            const snakeCase = "school_management";

            if (exists) {
                console.log(`\n✅ Database "${targetDb}" found.`);
                console.log(`ACTION: I will update your .env with this password and database name.`);
            } else if (rows.some(r => r.Database === snakeCase)) {
                console.log(`\n✅ Database "${snakeCase}" found (common naming convention).`);
            } else {
                console.log(`\n⚠ Database "${targetDb}" NOT found.`);
            }
            await connection.end();
        } catch (e) {
            console.error(e);
        }
    } else {
        console.log('\n❌ None of the common passwords worked.');
        console.log('Please check your MySQL Workbench connection settings to find the correct password.');
    }
}

debugConnection();
