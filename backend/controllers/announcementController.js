const pool = require('../config/db');

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
    const { role, class_id } = req.query;
    try {
        let sql = 'SELECT * FROM announcements WHERE 1=1';
        let params = [];

        if (role) {
            sql += ' AND (target_role = ? OR target_role = "all")';
            params.push(role.toLowerCase());
        }

        if (class_id) {
            sql += ' AND (class_id = ? OR class_id IS NULL)';
            params.push(class_id);
        }

        sql += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
    const { title, content, target_role, class_id, display_until } = req.body;
    const posted_by = req.user ? req.user.id : null;
    const file_path = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [result] = await pool.query(
            'INSERT INTO announcements (title, content, target_role, class_id, posted_by, display_until, file_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, content, target_role || 'all', class_id || null, posted_by, display_until || null, file_path]
        );
        res.status(201).json({ id: result.insertId, message: 'Announcement created', file_path });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
