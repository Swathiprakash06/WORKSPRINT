const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { ensureAuth } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();
const superAdminController = require('../controllers/superAdminController');

router.post('/login', [body('email').isEmail(), body('password').isLength({ min: 6 })], validateRequest, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', [body('refreshToken').notEmpty()], validateRequest, authController.refreshToken);
router.post('/change-password', [body('email').isEmail(), body('oldPassword').notEmpty(), body('newPassword').isLength({ min: 6 })], validateRequest, authController.changePassword);
router.post('/forgot-password', [body('email').isEmail()], validateRequest, authController.forgotPassword);
router.post('/reset-password', [body('email').isEmail(), body('token').notEmpty(), body('newPassword').isLength({ min: 6 })], validateRequest, authController.resetPassword);
router.post('/enquiry', [body('companyName').notEmpty(), body('hrName').notEmpty(), body('email').isEmail(), body('phone').notEmpty(), body('employeeSize').isInt({ min: 1 })], validateRequest, superAdminController.createEnquiry);

module.exports = router;
