const jwt = require('jsonwebtoken');
const env = require('../config/env');

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }

    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.user = payload; // { sub, username, role, iat, exp }
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        return next();
    };
}

module.exports = {
    requireAuth,
    requireRole,
};