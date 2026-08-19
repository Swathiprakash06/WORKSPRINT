const express = require('express');
const { body, query } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { ensureAuth, authorizeRoles } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const c = require('../controllers/hrAdminController');

const router = express.Router();
router.use(ensureAuth, authorizeRoles('hrAdmin'));

router.get('/profile', c.getProfile);
router.put('/profile', c.updateProfile);
router.post('/profile/picture', upload.single('photo'), c.uploadProfilePicture);
router.post('/profile/change-password', [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })], validateRequest, c.changePassword);

router.get('/dashboard/stats', c.getDashboardStats);
router.get('/employees', c.listEmployees);
// Phone is optional in the frontend; accept empty/omitted phone here and validate length when provided.
router.post('/employees', [
  body('name').notEmpty().withMessage('name is required'),
  body('email').isEmail().withMessage('email must be valid'),
  body('phone').optional().isString().withMessage('phone must be a string when provided'),
], validateRequest, c.createEmployee);
router.put('/employees/:id', c.updateEmployee);
router.delete('/employees/:id', c.deactivateEmployee);
router.post('/employees/:id/send-credentials', c.sendCredentials);
router.post('/employees/:id/reset-password', [body('password').isLength({ min: 6 })], validateRequest, c.resetEmployeePassword);

router.get('/attendance', c.getAttendance);
router.get('/attendance/today', c.getTodayAttendance);
router.get('/attendance/employee/:employeeId', c.getEmployeeAttendance);
router.put('/attendance/:id', c.editAttendance);
router.post('/attendance/simulate', [
  body('employeeId').isInt(),
  body('hours').isFloat({ min: 0 }),
  body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
], validateRequest, c.simulateAttendance);
router.post('/attendance/manual-mark', [
  body('employeeId').notEmpty().withMessage('employeeId is required'),
  body('hours').notEmpty().withMessage('hours is required'),
  body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  body('note').optional().isString(),
], validateRequest, c.manualMarkAttendance);
router.get('/employees/:employeeId/salary-credits', c.getEmployeeSalaryCredits);
router.get('/notifications', c.getNotifications);
router.put('/notifications/:id/read', c.markNotificationRead);
router.put('/notifications/read-all', c.markAllNotificationsRead);

router.get('/leave-requests', c.getLeaveRequests);
router.put('/leave-requests/:id/approve', c.approveLeave);
router.put('/leave-requests/:id/reject', c.rejectLeave);

router.get('/late-requests', c.getLateRequests);
router.put('/late-requests/:id/approve', c.approveLate);
router.put('/late-requests/:id/reject', c.rejectLate);

router.get('/holidays', c.getHolidays);
router.post('/holidays', [body('name').notEmpty(), body('dates').isArray({ min: 1 }), body('dates.*').isISO8601()], validateRequest, c.addHoliday);
router.delete('/holidays/:id', c.deleteHoliday);

router.get('/settings', c.getSettings);
router.put('/settings', c.updateSettings);

router.get('/reports/monthly', [query('month').isInt({ min: 1, max: 12 }), query('year').isInt()], validateRequest, c.getMonthlyReport);
router.get('/reports/export', c.exportAttendance);
router.get('/reports/monthly-salary', [
  query('employeeId').isInt(),
  query('month').isInt({ min: 1, max: 12 }),
  query('year').isInt(),
], validateRequest, c.getMonthlySalarySummary);
router.get('/reports/monthly-salary/export', [
  query('employeeId').isInt(),
  query('month').isInt({ min: 1, max: 12 }),
  query('year').isInt(),
], validateRequest, c.exportMonthlySalarySummary);

router.get('/queries', c.listEmployeeQueries);
router.get('/admin-queries', c.listAdminQueries);
router.post('/admin-queries', [body('subject').notEmpty(), body('message').notEmpty()], validateRequest, c.createAdminQuery);
router.put('/admin-queries/:id/respond', [body('response').notEmpty()], validateRequest, c.respondToAdminQuery);
router.put('/queries/:id/respond', [
  body('response').notEmpty().trim(),
  body('status').optional().isIn(['answered', 'closed']),
], validateRequest, c.respondToEmployeeQuery);

module.exports = router;
