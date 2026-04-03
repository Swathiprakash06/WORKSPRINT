const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../db/prismaClient');
const catchAsync = require('../utils/catchAsync');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../services/tokenService');
const { sendMail } = require('../services/mailService');
const AppError = require('../utils/AppError');

const getUserByEmail = async (email) => {
  const superAdmin = await prisma.superAdmin.findUnique({ where: { email } });
  if (superAdmin) return { ...superAdmin, role: 'superAdmin', userType: 'superAdmin' };

  const hr = await prisma.hrAdmin.findUnique({ where: { email } });
  if (hr) return { ...hr, role: 'hrAdmin', userType: 'hrAdmin' };

  const employee = await prisma.employee.findUnique({ where: { email } });
  if (employee) return { ...employee, role: 'employee', userType: 'employee' };

  return null;
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log('🔐 LOGIN ATTEMPT:', { email, password: password ? '[PROVIDED]' : '[MISSING]' });
  
  const user = await getUserByEmail(email);
  if (!user) { 
    console.log('❌ User not found:', email);
    return next(new AppError('Invalid credentials', 401)); 
  }

  console.log('✅ User found:', { id: user.id, role: user.role });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) { 
    console.log('❌ Invalid password for user:', email);
    return next(new AppError('Invalid credentials', 401)); 
  }

  const payload = { id: user.id, role: user.role || 'employee', email: user.email, organizationId: user.organizationId || null };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload, process.env.JWT_REFRESH_EXPIRY || process.env.REFRESH_TOKEN_EXPIRY || '7d');

  await prisma.refreshToken.upsert({
    where: { userEmail: user.email },
    update: { token: refreshToken, updatedAt: new Date() },
    create: { userEmail: user.email, token: refreshToken },
  }).catch(() => {});

  res.json({ accessToken, refreshToken, role: user.role, user: { id: user.id, email: user.email } });
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(200).json({ message: 'Logged out' });
  }

  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  return res.json({ message: 'Logged out' });
};

const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) { return next(new AppError('Missing refresh token', 401)); }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    return next(new AppError('Invalid refresh token', 401));
  }

  const dbToken = await prisma.refreshToken.findUnique({ where: { userEmail: payload.email } });
  if (!dbToken || dbToken.token !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  const newAccessToken = signAccessToken({ id: payload.id, role: payload.role, email: payload.email });
  const newRefreshToken = signRefreshToken({ id: payload.id, role: payload.role, email: payload.email });

  await prisma.refreshToken.update({
    where: { userEmail: payload.email },
    data: { token: newRefreshToken },
  });

  return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
};

const changePassword = async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;
  const user = await getUserByEmail(email);
  if (!user) { return next(new AppError('User not found', 404)); }

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) { return next(new AppError('Current password incorrect', 400)); }

  const hashed = await bcrypt.hash(newPassword, 10);

  if (user.userType === 'employee') {
    await prisma.employee.update({ where: { email }, data: { password: hashed } });
  } else {
    await prisma.hrAdmin.update({ where: { email }, data: { password: hashed } });
  }

  res.json({ message: 'Password updated' });
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);
  if (!user) { return next(new AppError('User not found', 404)); }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordReset.upsert({
    where: { email },
    update: { token, expires },
    create: { email, token, expires },
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;
  await sendMail({
    to: email,
    subject: 'WORKSPRINT Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });

  res.json({ message: 'Reset link sent' });
};

const resetPassword = async (req, res, next) => {
  const { email, token, newPassword } = req.body;
  const record = await prisma.passwordReset.findUnique({ where: { email } });

  if (!record || record.token !== token || record.expires < new Date()) {
    return next(new AppError('Token invalid or expired', 400));
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  const user = await getUserByEmail(email);
  if (!user) { return next(new AppError('User not found', 404)); }

  if (user.userType === 'employee') {
    await prisma.employee.update({ where: { email }, data: { password: hashed } });
  } else {
    await prisma.hrAdmin.update({ where: { email }, data: { password: hashed } });
  }

  await prisma.passwordReset.delete({ where: { email } });
  res.json({ message: 'Password reset successful' });
};

module.exports = {
  login: catchAsync(login),
  logout: catchAsync(logout),
  refreshToken: catchAsync(refreshToken),
  changePassword: catchAsync(changePassword),
  forgotPassword: catchAsync(forgotPassword),
  resetPassword: catchAsync(resetPassword),
};
