const jwt = require('jsonwebtoken');

const signAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' });
const signRefreshToken = (payload, expiresIn = process.env.REFRESH_TOKEN_EXPIRY || '7d') => jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });

const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken };
