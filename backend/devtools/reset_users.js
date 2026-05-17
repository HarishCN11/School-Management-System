const db = require('./config/db');
require('dotenv').config();

async function resetAllUsers() {
    try {
        console.log("⚠️ STARTING FULL RESET: Keeping only ADMIN, deleting all other users...");

        // 1. Get the ID of the Admin
        const [admins] = await db.query("SELECT id, email FROM users WHERE role = 'admin' OR role = 'Admin'");

        if (admins.length === 0) {
            console.error("❌ CRITICAL ERROR: No Admin found! Cannot proceed safely.");
            process.exit(1);
        }

        const adminId = admins[0].id;
        console.log(`✅ Identified Admin (ID: ${adminId}, Email: ${admins[0].email}) - SAFE.`);

        console.log("🗑️ Deleting all non-admin users...");

        // Disable foreign key checks to allow mass deletion
        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        // Delete from all related tables just in case cascade is missing
        await db.query('DELETE FROM students');
        await db.query('DELETE FROM teachers');
        await db.query('DELETE FROM parents');
        await db.query('DELETE FROM principals');
        await db.query('DELETE FROM users WHERE id != ?', [adminId]);

        // Re-enable foreign keys
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log("✅ RESET COMPLETE. All other users have been removed.");
        console.log("🚀 You can now register any email address fresh.");

    } catch (e) {
        console.error("❌ ERROR:", e);
    }
    process.exit(0);
}

resetAllUsers();
