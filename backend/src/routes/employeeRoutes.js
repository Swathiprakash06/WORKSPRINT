const express = require('express');
const { body, query } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { ensureAuth, authorizeRoles } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const c = require('../controllers/employeeController');

const router = express.Router();
router.use(ensureAuth, authorizeRoles('employee'));

router.get('/profile', c.getProfile);
router.put('/profile', c.updateProfile);
router.post('/profile/change-password', [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })], validateRequest, c.changePassword);
router.post('/profile/picture', upload.single('photo'), c.uploadProfilePicture);
router.post('/attendance/check-in', [
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  body('lateReason').optional().isString(),
], validateRequest, c.checkIn);
router.post('/attendance/mark-absent', [
  body('date').isISO8601(),
], validateRequest, c.markAbsent);
router.post('/attendance/check-out', [
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  body('earlyCheckoutReason').optional().isString(),
], validateRequest, c.checkOut);
router.get('/attendance/history', c.getAttendanceHistory);
router.get('/attendance/export', c.exportAttendance);
router.get('/attendance/monthly', [query('month').isInt({ min: 1, max: 12 }), query('year').isInt()], validateRequest, c.getMonthlySummary);
router.get('/salary/daily', c.getDailySalary);
router.get('/notifications', c.getNotifications);
router.put('/notifications/:id/read', c.markNotificationRead);
router.put('/notifications/read-all', c.markAllNotificationsRead);
router.post('/queries', [
  body('subject').notEmpty().trim(),
  body('message').notEmpty().trim(),
], validateRequest, c.submitQuery);
router.get('/queries', c.getMyQueries);
router.post('/leave-requests/batch', [
  body('type').notEmpty(),
  body('reason').notEmpty(),
  body('dates').isArray({ min: 1 }),
  body('dates.*').isString(),
], validateRequest, c.submitLeaveRequestsBatch);
router.post('/leave-requests', [body('type').notEmpty(), body('date').isISO8601(), body('reason').notEmpty()], validateRequest, c.submitLeaveRequest);
router.get('/leave-requests', c.getMyLeaveRequests);
router.post('/late-requests', [body('date').isISO8601(), body('reason').notEmpty()], validateRequest, c.submitLateRequest);
router.get('/late-requests', c.getMyLateRequests);
router.get('/dashboard', c.getDashboard);
router.get('/holidays', c.getHolidays);
router.get('/settings', c.getSettings);

module.exports = router;
