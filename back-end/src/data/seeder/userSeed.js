const bcrypt = require('bcryptjs');

function createUserSeed() {
    // hashSync is fine for seed-at-startup (runs once)
    return [
        {
            id: 1,
            username: 'admin',
            passwordHash: bcrypt.hashSync('admin123', 10),
            role: 'admin',
        },
        {
            id: 2,
            username: 'operator',
            passwordHash: bcrypt.hashSync('operator123', 10),
            role: 'operator',
        },
    ];
}

module.exports = { createUserSeed };
