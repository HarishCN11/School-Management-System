const db = require('../config/db');

exports.getAllPrincipals = async (req, res) => {
    try {
        const query = `
            SELECT p.id, u.id as user_id, u.name, u.email, p.experience_years, p.contact_number
            FROM principals p
            JOIN users u ON p.user_id = u.id
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createPrincipalProfile = async (req, res) => {
    const { user_id, experience_years, contact_number } = req.body;
    try {
        const finalExp = experience_years === '' ? null : experience_years;
        await db.query(
            'INSERT INTO principals (user_id, experience_years, contact_number) VALUES (?, ?, ?)',
            [user_id, finalExp, contact_number]
        );
        res.status(201).json({ message: 'Principal profile created' });
    } catch (error) {
        console.error('Error creating principal profile:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

exports.updatePrincipal = async (req, res) => {
    const { name, email, experience_years, contact_number } = req.body;
    const { id } = req.params;
    try {
        const [p] = await db.query('SELECT user_id FROM principals WHERE id = ?', [id]);
        if (p.length === 0) return res.status(404).json({ message: 'Not found' });
        const userId = p[0].user_id;

        const finalExp = experience_years === '' ? null : experience_years;

        await db.query('UPDATE users SET name=?, email=? WHERE id=?', [name, email, userId]);
        await db.query('UPDATE principals SET experience_years=?, contact_number=? WHERE id=?', [finalExp, contact_number, id]);
        res.json({ message: 'Updated' });
    } catch (error) {
        console.error('Error updating principal:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

exports.deletePrincipal = async (req, res) => {
    try {
        const [p] = await db.query('SELECT user_id FROM principals WHERE id = ?', [req.params.id]);
        if (p.length === 0) return res.status(404).json({ message: 'Not found' });

        // Delete profile then user
        await db.query('DELETE FROM principals WHERE id = ?', [req.params.id]);
        await db.query('DELETE FROM users WHERE id = ?', [p[0].user_id]);

        res.json({ message: 'Principal and user account deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const [[studentCount]] = await db.query('SELECT COUNT(*) as count FROM students');
        const [[teacherCount]] = await db.query('SELECT COUNT(*) as count FROM teachers');
        const [[classCount]] = await db.query('SELECT COUNT(*) as count FROM classes');
        const [[inventoryCount]] = await db.query('SELECT COUNT(*) as count FROM inventory');
        const [[announcementCount]] = await db.query('SELECT COUNT(*) as count FROM announcements');

        res.json({
            students: studentCount.count,
            teachers: teacherCount.count,
            classes: classCount.count,
            inventory: inventoryCount.count,
            announcements: announcementCount.count
        });
    } catch (error) {
        console.error('Error fetching principal stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentsWithParents = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.id as student_id,
                u_s.name as student_name,
                u_s.email as student_email,
                s.admission_number,
                c.name as class_name,
                u_p.name as parent_name,
                u_p.email as parent_email,
                p.phone_number as parent_phone
            FROM students s
            JOIN users u_s ON s.user_id = u_s.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN parents p ON p.student_id = s.id
            LEFT JOIN users u_p ON p.user_id = u_p.id
            ORDER BY c.name, u_s.name
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching students with parents:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
