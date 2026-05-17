const db = require('../config/db');

// Send Message
exports.sendMessage = async (req, res) => {
    const { receiver_role, receiver_id, subject, message } = req.body;
    const sender_id = req.user.id;

    try {
        await db.query(`
            INSERT INTO admin_messages (sender_id, receiver_role, receiver_id, subject, message)
            VALUES (?, ?, ?, ?, ?)
        `, [sender_id, receiver_role, receiver_id || null, subject, message]);

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Teacher: Get my messages with admin
exports.getTeacherAdminMessages = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
            SELECT m.*, u.name as sender_name, u.role as sender_role
            FROM admin_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = ? AND m.receiver_role = 'admin')
               OR (m.receiver_id = ? AND m.receiver_role = 'teacher')
            ORDER BY m.created_at DESC
        `;
        const [rows] = await db.query(query, [userId, userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get all messages
exports.getAdminMessages = async (req, res) => {
    try {
        const query = `
            SELECT m.*, u.name as sender_name, u.role as sender_role
            FROM admin_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_role = 'admin' OR m.sender_id IN (SELECT id FROM users WHERE role = 'admin')
            ORDER BY m.created_at DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark as Read
exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE admin_messages SET is_read = TRUE WHERE id = ?', [id]);
        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
