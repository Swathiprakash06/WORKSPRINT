const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code?.startsWith('P')) {
    console.error('[Prisma error]', err.code, err.message);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[API error]', err);
  }

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = 'Something went wrong!';
  }

  if (err.code === 'P2002') {
    statusCode = 409;
    message = `Duplicate field value: ${Object.values(err.meta.target).join(', ')}`;
  }

  if (err.code === 'P2022') {
    statusCode = 503;
    message = err.message || 'Database schema is out of date. Contact your administrator.';
  }

  res.status(statusCode).json({ status: err.status || 'error', message });
};

const notFound = (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFound };
