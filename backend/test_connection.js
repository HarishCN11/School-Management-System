const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('Test 1: Attempting connection to 127.0.0.1:3306...');
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: ''
        });
        
        console.log('✅ Connected successfully!');
        const [rows] = await connection.execute('SHOW DATABASES;');
        console.log('Databases:', rows);
        await connection.end();
    } catch (error) {
        console.error('❌ Connection with 127.0.0.1 failed:', error.code, error.message);
        
        try {
            console.log('\nTest 2: Attempting connection with namedPipe...');
            const connection = await mysql.createConnection({
                user: 'root',
                password: '',
                namedPipe: '\\\\?\\pipe\\MySQL'
            });
            
            console.log('✅ Connected successfully with named pipe!');
            await connection.end();
        } catch (error2) {
            console.error('❌ Named pipe also failed:', error2.code, error2.message);
        }
    }
}

testConnection();

