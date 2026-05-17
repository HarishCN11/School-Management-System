const db = require('../config/db');

exports.getAllParents = async (req, res) => {
    try {
        const query = `
            SELECT pr.id, u.id as user_id, u.name, u.email, pr.phone_number, s.name as student_name, pr.student_id
            FROM parents pr
            JOIN users u ON pr.user_id = u.id
            LEFT JOIN students st ON pr.student_id = st.id
            LEFT JOIN users s ON st.user_id = s.id
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createParentProfile = async (req, res) => {
    const { user_id, student_id, phone_number } = req.body;
    try {
        const finalStudentId = student_id === '' ? null : student_id;
        await db.query(
            'INSERT INTO parents (user_id, student_id, phone_number) VALUES (?, ?, ?)',
            [user_id, finalStudentId, phone_number]
        );
        res.status(201).json({ message: 'Parent profile created' });
    } catch (error) {
        console.error('Error creating parent profile:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

exports.updateParent = async (req, res) => {
    const { name, email, student_id, phone_number } = req.body;
    const { id } = req.params;
    try {
        const [p] = await db.query('SELECT user_id FROM parents WHERE id = ?', [id]);
        if (p.length === 0) return res.status(404).json({ message: 'Not found' });
        const userId = p[0].user_id;

        const finalStudentId = student_id === '' ? null : student_id;

        await db.query('UPDATE users SET name=?, email=? WHERE id=?', [name, email, userId]);
        await db.query('UPDATE parents SET student_id=?, phone_number=? WHERE id=?', [finalStudentId, phone_number, id]);
        res.json({ message: 'Updated' });
    } catch (error) {
        console.error('Error updating parent:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

exports.deleteParent = async (req, res) => {
    try {
        const [p] = await db.query('SELECT user_id FROM parents WHERE id = ?', [req.params.id]);
        if (p.length === 0) return res.status(404).json({ message: 'Not found' });

        // Delete profile then user
        await db.query('DELETE FROM parents WHERE id = ?', [req.params.id]);
        await db.query('DELETE FROM users WHERE id = ?', [p[0].user_id]);

        res.json({ message: 'Parent and user account deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
