const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const userStore = require('../../data/userStore');

function login(req, res) {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    const user = userStore.findByUsername(String(username).trim());
    if (!user) {
        // message for wrong username/password
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const ok = bcrypt.compareSync(password, user.passwordHash);
    if(!ok) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
        {
            sub: user.id,
            username: user.username,
            role: user.role,
        },
        env.jwtSecret,
        {
            expiresIn: env.jwtExpiresIn,
        }
    );

    return res.status(200).json({
        token,
        user: userStore.toPublicUser(user),
    });
}

function me(req, res) {
    // req.user set by middleware
    const user = userStore.findById(req.user.sub);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user: userStore.toPublicUser(user) });
}

module.exports = {
    login,
    me,
};