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
router.post('/employees', [body('name').notEmpty(), body('email').isEmail(), body('phone').notEmpty()], validateRequest, c.createEmployee);
router.put('/employees/:id', c.updateEmployee);
router.delete('/employees/:id', c.deactivateEmployee);
router.post('/employees/:id/send-credentials', c.sendCredentials);

router.get('/attendance', c.getAttendance);
router.get('/attendance/today', c.getTodayAttendance);
router.get('/attendance/employee/:employeeId', c.getEmployeeAttendance);
router.put('/attendance/:id', c.editAttendance);

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

module.exports = router;
