const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Build a robust, developer-friendly message even if validator doesn't provide 'param'.
    const details = errors.array().map((el) => {
      const param = el.param || el.path || el.location || 'field';
      return `${param}: ${el.msg}`;
    });
    // Attach the raw errors array to the error for easier debugging in error handler (if supported).
    const err = new AppError(details.join(', '), 400);
    err.validation = errors.array();
    return next(err);
  }
  next();
};

module.exports = validateRequest;
