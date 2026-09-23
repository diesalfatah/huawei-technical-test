require('dotenv').config();

const env = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
};

if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is missing');
}

module.exports = env;
