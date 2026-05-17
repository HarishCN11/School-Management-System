const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const tokenParts = authHeader.split(' ');
    const bearerToken = tokenParts.length === 2 ? tokenParts[1] : tokenParts[0];

    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized / Invalid Token' });
        }

        // Attach user info to request object
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    });
};

module.exports = verifyToken;
