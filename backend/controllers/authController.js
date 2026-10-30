const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');

const validateStrongPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return 'Password must be at least 8 characters long.';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter.';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter.';
    if (!hasNumbers) return 'Password must contain at least one number.';
    return null;
};

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    console.log(`[AUTH] Register request for ${email} (Role: ${role})`);

    if (!name || !email || !password) {
        console.log(`[AUTH] Register failed: Missing fields`);
        return res.status(400).json({ message: 'Name, email, and password are all required.' });
    }

    const passwordError = validateStrongPassword(password);
    if (passwordError) {
        console.log(`[AUTH] Register failed: Weak password - ${passwordError}`);
        return res.status(400).json({ message: passwordError });
    }

    try {
        const [existing] = await db.query('SELECT id, role FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            const user = existing[0];
            if (user.role.toLowerCase() !== role.toLowerCase()) {
                 return res.status(400).json({ message: `This email is already registered as a ${user.role}. Please use a different email or correct the portal.` });
            }
            
            // Allow admin to take over this account by resetting its password.
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            
            await db.query('UPDATE users SET name = ?, password_hash = ? WHERE id = ?', [name, passwordHash, user.id]);
            
            return res.status(200).json({
                message: 'Account successfully re-linked',
                userId: user.id
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) RETURNING id',
            [name, email, passwordHash, role || 'student']
        );

        res.status(201).json({
            message: 'Account created successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Account Registration Error:', error);
        res.status(500).json({ message: 'Internal server error during account creation.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            console.log(`[AUTH] Login failed for ${email}: Incorrect password`);
            return res.status(401).json({ message: 'Incorrect password' });
        }

        console.log(`[AUTH] Login success for ${email} (Role: ${user.role})`);

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        let roleId = null;
        if (user.role === 'student') {
            const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [user.id]);
            if (students.length > 0) roleId = students[0].id;
        } else if (user.role === 'teacher') {
            const [teachers] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [user.id]);
            if (teachers.length > 0) roleId = teachers[0].id;
        } else if (user.role === 'principal') {
            const [principals] = await db.query('SELECT id FROM principals WHERE user_id = ?', [user.id]);
            if (principals.length > 0) roleId = principals[0].id;
        } else if (user.role === 'parent') {
            const [parents] = await db.query('SELECT id, student_id FROM parents WHERE user_id = ?', [user.id]);
            if (parents.length > 0) {
                roleId = parents[0].id;
                user.linkedStudentId = parents[0].student_id;
            }
        }

        // Security Check: Block login if the user has no official mapped profile (excluding Admin)
        if (user.role.toLowerCase() !== 'admin' && !roleId) {
            console.log(`[AUTH] Login blocked for ${email}: Account not linked to an official profile.`);
            return res.status(403).json({ message: 'Access Denied: Your account has not yet been officially registered by the administrator. Please contact your school.' });
        }

        res.json({
            token,
            user: {
                id: user.id,
                roleId: roleId, // Specific ID for the role table (students.id, teachers.id, etc.)
                name: user.name,
                email: user.email,
                role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
                profile_photo: user.profile_photo,
                linkedStudentId: user.linkedStudentId
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT id, name FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Using 400 instead of 404 to distinguish from "Route not found" network errors
            return res.status(400).json({ message: 'Email address not found in system.' });
        }

        const user = users[0];
        const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'; // Make temp password satisfy weak checks or force change?
        // Actually, generated temp passwords for reset might not need to strictly follow the pattern if the user is forced to change it.
        // But for consistency let's make it strong-ish or just random. 
        // NOTE: The previous code generated a simple random string.
        // Let's generate a temporary password that IS strong so they can login.
        const strongTempPassword = Math.random().toString(36).slice(-6) + 'A1!';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(strongTempPassword, salt);

        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);

        const message = `Hello ${user.name},\n\nYou requested a password reset. Your temporary password is: ${strongTempPassword}\n\nPlease login and change it immediately for security.\n\nRegards,\nSchool Management Team`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563EB;">Password Reset</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>Your temporary password is:</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; color: #1e40af; text-align: center; margin: 20px 0;">
                    ${strongTempPassword}
                </div>
                <p>Login and change it in your settings.</p>
            </div>`;

        try {
            await sendEmail({ email, subject: 'Temporary Password Action Required', message, html });
            res.json({ message: 'Sent successfully' });
        } catch (mailError) {
            console.error('Mail Send Error:', mailError);
            res.status(503).json({ message: 'Email service error. Password was reset but email fail. Check server logs.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPasswordWithTemp = async (req, res) => {
    const { email, tempPassword, newPassword } = req.body;

    if (!email || !tempPassword || !newPassword) {
        return res.status(400).json({ message: 'Email, temporary password, and new password are required.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Verify temporary password
        const isMatch = await bcrypt.compare(tempPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid temporary password.' });
        }

        // Validate new password
        const passwordError = validateStrongPassword(newPassword);
        if (passwordError) {
            return res.status(400).json({ message: passwordError });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, user.id]);

        res.json({ message: 'Password reset successfully. You can now login.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role.toLowerCase();

    try {
        let sql = 'SELECT id, name, email, role FROM users WHERE id = ?';
        const [users] = await db.query(sql, [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        let roleData = {};

        if (role === 'student') {
            const [data] = await db.query(`
                SELECT s.admission_number, c.name as class_name, s.dob, s.gender, s.address 
                FROM students s 
                LEFT JOIN classes c ON s.class_id = c.id 
                WHERE s.user_id = ?`, [userId]);
            if (data.length > 0) roleData = data[0];
        } else if (role === 'teacher') {
            const [data] = await db.query(`
                SELECT t.qualification, t.specialization, t.phone_number, t.address, t.managed_class_id,
                       c.name as managed_class_name
                FROM teachers t
                LEFT JOIN classes c ON t.managed_class_id = c.id
                WHERE t.user_id = ?`, [userId]);
            if (data.length > 0) roleData = data[0];
        } else if (role === 'principal') {
            const [data] = await db.query('SELECT experience_years, contact_number as phone_number FROM principals WHERE user_id = ?', [userId]);
            if (data.length > 0) roleData = data[0];
        } else if (role === 'parent') {
            const [data] = await db.query('SELECT phone_number FROM parents WHERE user_id = ?', [userId]);
            if (data.length > 0) roleData = data[0];
        }

        res.json({ ...user, ...roleData });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log(`[PROFILE] Update request for user ${userId}`);

    if (!currentPassword) {
        console.log(`[PROFILE] Failed: Missing current password`);
        return res.status(400).json({ message: 'Current password is required to make any changes.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            console.log(`[PROFILE] Failed: Incorrect current password for user ${userId}`);
            return res.status(401).json({ message: 'Current password incorrect' });
        }

        let sql = 'UPDATE users SET name = ?';
        let params = [name || user.name];

        // Handle Email Update
        if (email && email !== user.email) {
            // Check uniqueness
            const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (existing.length > 0) {
                console.log(`[PROFILE] Failed: Email ${email} already taken`);
                return res.status(400).json({ message: 'This email is already taken.' });
            }
            sql += ', email = ?';
            params.push(email);
        }

        // Handle Password Update
        if (newPassword) {
            const passwordError = validateStrongPassword(newPassword);
            if (passwordError) {
                console.log(`[PROFILE] Failed: Weak password - ${passwordError}`);
                return res.status(400).json({ message: passwordError });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            sql += ', password_hash = ?';
            params.push(hashedPassword);
        }

        // Handle Profile Photo
        if (req.file) {
            sql += ', profile_photo = ?';
            params.push(req.file.url || `/uploads/profiles/${req.file.filename}`);
        }

        sql += ' WHERE id = ?';
        params.push(userId);

        await db.query(sql, params);
        // Role Specific Updates
        const { role } = user;
        const roleLower = role.toLowerCase();
        
        if (roleLower === 'student') {
            const { dob, gender, address } = req.body;
            if (dob !== undefined || gender !== undefined || address !== undefined) {
                await db.query('UPDATE students SET dob = COALESCE(?, dob), gender = COALESCE(?, gender), address = COALESCE(?, address) WHERE user_id = ?', 
                [dob, gender, address, userId]);
            }
        } else if (roleLower === 'teacher') {
            const { qualification, specialization, phone_number, address } = req.body;
            if (qualification !== undefined || specialization !== undefined || phone_number !== undefined || address !== undefined) {
                await db.query('UPDATE teachers SET qualification = COALESCE(?, qualification), specialization = COALESCE(?, specialization), phone_number = COALESCE(?, phone_number), address = COALESCE(?, address) WHERE user_id = ?', 
                [qualification, specialization, phone_number, address, userId]);
            }
        } else if (roleLower === 'principal') {
            const { experience_years, phone_number } = req.body;
            if (experience_years !== undefined || phone_number !== undefined) {
                await db.query('UPDATE principals SET experience_years = COALESCE(?, experience_years), contact_number = COALESCE(?, contact_number) WHERE user_id = ?', 
                [experience_years, phone_number, userId]);
            }
        } else if (roleLower === 'parent') {
            const { phone_number, address } = req.body;
            if (phone_number !== undefined || address !== undefined) {
                await db.query('UPDATE parents SET phone_number = COALESCE(?, phone_number), address = COALESCE(?, address) WHERE user_id = ?', 
                [phone_number, address, userId]);
            }
        }

        console.log(`[PROFILE] Success: Profile updated for user ${userId}`);
        res.json({
            message: 'Profile updated successfully',
            profile_photo: req.file ? (req.file.url || `/uploads/profiles/${req.file.filename}`) : user.profile_photo
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.adminResetUserPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    if (req.user.role !== 'admin' && req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);
        res.json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};
