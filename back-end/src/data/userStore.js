const { createUserSeed } = require('./seeder/userSeed');

const users = createUserSeed();

function findByUsername(username) {
    return users.find((u) => u.username === username) || null;
}

function findById(id) {
    return users.find((u) => u.id === id) || null;
}

function toPublicUser(user) {
    return {
        id: user.id,
        username: user.username,
        role: user.role,
    };
}

module.exports = {
    findByUsername,
    findById,
    toPublicUser,
};
