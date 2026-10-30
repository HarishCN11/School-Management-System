function authorizeRoles(...allowedRoles) {
    const roles = new Set(allowedRoles.map(role => role.toLowerCase()));

    return (req, res, next) => {
        const role = req.user?.role?.toLowerCase();
        if (!role || !roles.has(role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
}

module.exports = authorizeRoles;
