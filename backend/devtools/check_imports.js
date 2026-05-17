
const fs = require('fs');

const modules = [
    { name: './config/db', path: './config/db' },
    { name: 'bcrypt', path: 'bcrypt' },
    { name: 'jsonwebtoken', path: 'jsonwebtoken' },
    { name: './utils/emailService', path: './utils/emailService' },
    { name: 'express', path: 'express' },
    { name: 'cors', path: 'cors' },
    { name: 'dotenv', path: 'dotenv' },
    { name: 'mysql2', path: 'mysql2' },
    { name: 'nodemailer', path: 'nodemailer' }
];

let output = 'Checking imports...\n';

modules.forEach(mod => {
    try {
        require(mod.path);
        output += `✅ ${mod.name} loaded successfully\n`;
    } catch (error) {
        output += `❌ ${mod.name} FAILED to load: ${error.message}\n`;
        if (error.code) output += `   Code: ${error.code}\n`;
    }
});

fs.writeFileSync('import_results.txt', output);
console.log('Done writing results to import_results.txt');
