const db = require('../config/db');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

async function seedData() {
    try {
        const connection = await db.getConnection();
        console.log('Connected to database...');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        // Using a stronger default password: 'School@2026!'
        const hashedPassword = await bcrypt.hash('School@2026!', salt);

        // 1. Users
        console.log('Seeding Users...');
        const users = [
            ['Admin User', 'vivekanandhatamilvidyalayam@gmail.com', hashedPassword, 'admin'],
            ['Teacher One', 'teacher1@school.com', hashedPassword, 'teacher'],
            ['Student One', 'student1@school.com', hashedPassword, 'student'],
            ['Parent One', 'parent1@school.com', hashedPassword, 'parent'],
            ['Principal User', 'principal@school.com', hashedPassword, 'principal']
        ];

        for (const user of users) {
            await connection.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role)',
                user
            );
        }

        // Get IDs
        const [userRows] = await connection.query('SELECT id, role FROM users');
        const adminId = userRows.find(u => u.role === 'admin').id;
        const teacherId = userRows.find(u => u.role === 'teacher').id;
        const studentId = userRows.find(u => u.role === 'student').id;
        const parentId = userRows.find(u => u.role === 'parent').id;
        const principalId = userRows.find(u => u.role === 'principal').id;

        // 2. Classes
        await connection.query('INSERT IGNORE INTO classes (id, name, room_number, capacity) VALUES (1, "Class 10-A", "101", 40)');
        const classId = 1;

        // 3. Profiles with Verification Data
        console.log('Seeding Profiles...');

        // Student: Admission No: S101, Address: 123 School St
        await connection.query(
            'INSERT INTO students (user_id, class_id, admission_number, dob, gender, address) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE admission_number=VALUES(admission_number), address=VALUES(address)',
            [studentId, classId, 'S101', '2008-01-01', 'male', '123 School St']
        );
        const [studentRows] = await connection.query('SELECT id FROM students WHERE user_id = ?', [studentId]);
        const studentProfileId = studentRows[0].id;

        // Teacher: Specialization: Mathematics, Phone: 9876543210
        await connection.query(
            'INSERT INTO teachers (user_id, qualification, specialization, phone_number) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE specialization=VALUES(specialization), phone_number=VALUES(phone_number)',
            [teacherId, 'MSc Math', 'Mathematics', '9876543210']
        );

        // Principal: Contact: 1122334455
        await connection.query(
            'INSERT INTO principals (user_id, experience_years, contact_number) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE contact_number=VALUES(contact_number)',
            [principalId, 15, '1122334455']
        );

        // Parent: Linked Student: Student One, Phone: 5566778899
        await connection.query(
            'INSERT INTO parents (user_id, student_id, phone_number) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE student_id=VALUES(student_id), phone_number=VALUES(phone_number)',
            [parentId, studentProfileId, '5566778899']
        );

        // Admin Profile: Contact: admin-secret-123
        await connection.query(
            'INSERT INTO admin_profiles (user_id, contact_detail) VALUES (?, ?) ON DUPLICATE KEY UPDATE contact_detail=VALUES(contact_detail)',
            [adminId, 'admin-secret-123']
        );

        console.log('Seeding complete!');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedData();
