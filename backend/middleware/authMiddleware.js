const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || Buffer.from('YTNjOGVjYTk3OGM1YzVjMjdjMjcwNTRmNmUxMGRiY2E0NjgxNjEyNjVmMTdkYjNkMjE3ZDQ4OWUyMGY0ZjM1Ng==', 'base64').toString('utf-8');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const tokenParts = authHeader.split(' ');
    const bearerToken = tokenParts.length === 2 ? tokenParts[1] : tokenParts[0];

    jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
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
