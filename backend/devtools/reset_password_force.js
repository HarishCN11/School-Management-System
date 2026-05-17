const db = require('./config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetAdminPass() {
    try {
        const email = 'vivekanandhatamilvidyalayam@gmail.com';
        const newPass = 'School@2026!';

        console.log(`Resetting password for ${email}...`);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPass, salt);

        await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email]);

        console.log(`✅ Password reset to: ${newPass}`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

resetAdminPass();
