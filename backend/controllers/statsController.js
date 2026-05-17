const db = require('../config/db');

exports.getAdminStats = async (req, res) => {
    try {
        // 1. Get user counts by role
        const [userCounts] = await db.query(`
            SELECT role, COUNT(*) as count 
            FROM users 
            GROUP BY role
        `);

        // 2. Get inventory status
        const [inventoryStatus] = await db.query(`
            SELECT status, COUNT(*) as count 
            FROM inventory 
            GROUP BY status
        `);

        // 3. Get recent announcements
        const [recentAnnouncements] = await db.query(`
            SELECT title, created_at, target_role as target 
            FROM announcements 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        // 4. Get class counts
        const [classCount] = await db.query('SELECT COUNT(*) as count FROM classes');

        res.json({
            users: userCounts,
            inventory: inventoryStatus,
            announcements: recentAnnouncements,
            totalClasses: classCount[0].count
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Failed to fetch system statistics' });
    }
};
