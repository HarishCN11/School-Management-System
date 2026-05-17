const db = require('./config/db');
db.query('SELECT id, name FROM subjects').then(([r]) => {
    r.forEach(s => console.log(s.id + ': ' + s.name));
    process.exit(0);
});
