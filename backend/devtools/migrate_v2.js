const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting Migration V2...');

        // 1. Update assignments table
        const [assignmentsCols] = await db.query('DESCRIBE assignments');
        const assignmentFields = assignmentsCols.map(c => c.Field);

        if (!assignmentFields.includes('status')) {
            console.log('Adding status column to assignments...');
            await db.query("ALTER TABLE assignments ADD COLUMN status ENUM('active', 'closed') DEFAULT 'active'");
        }

        if (!assignmentFields.includes('teacher_id')) {
            console.log('Adding teacher_id column to assignments...');
            await db.query('ALTER TABLE assignments ADD COLUMN teacher_id INT AFTER subject_id');
            await db.query('ALTER TABLE assignments ADD FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL');
        }

        // 2. Update study_materials table
        const [materialsCols] = await db.query('DESCRIBE study_materials');
        const materialFields = materialsCols.map(c => c.Field);

        if (!materialFields.includes('teacher_id')) {
            console.log('Adding teacher_id column to study_materials...');
            await db.query('ALTER TABLE study_materials ADD COLUMN teacher_id INT AFTER subject_id');
            await db.query('ALTER TABLE study_materials ADD FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL');
        }

        // 3. Create inventory_allocations table
        console.log('Creating inventory_allocations table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS inventory_allocations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                inventory_id INT NOT NULL,
                class_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                reason VARCHAR(255),
                allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )
        `);

        // 4. Create admin_messages table (Teacher to Admin and vice-versa)
        console.log('Creating admin_messages table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS admin_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_role ENUM('admin', 'teacher') NOT NULL,
                receiver_id INT, -- If null and receiver_role is 'admin', it goes to all admins
                subject VARCHAR(255),
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('Migration V2 completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
