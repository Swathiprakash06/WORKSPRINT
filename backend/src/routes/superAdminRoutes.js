const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { ensureAuth, authorizeRoles } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const controller = require('../controllers/superAdminController');

const router = express.Router();

router.use(ensureAuth, authorizeRoles('superAdmin'));

router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);
router.post('/profile/picture', upload.single('photo'), controller.uploadProfilePicture);
router.post('/profile/change-password', [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })], validateRequest, controller.changePassword);

router.get('/dashboard/stats', controller.getDashboardStats);
router.get('/enquiries', controller.getEnquiries);
router.post('/enquiries/:id/accept', controller.acceptEnquiry);
router.post('/enquiries/:id/reject', controller.rejectEnquiry);
router.get('/organizations', controller.getOrganizations);
router.get('/organizations/:id', controller.getOrganization);
router.put('/organizations/:id', controller.updateOrganization);
router.post('/organizations/:id/suspend', controller.suspendOrganization);
router.delete('/organizations/:id', controller.deleteOrganization);

router.post('/hr-admins', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('organizationId').isInt(),
], validateRequest, controller.createHrAdmin);

router.get('/hr-admins', controller.listHrAdmins);
router.put('/hr-admins/:id', controller.updateHrAdmin);
router.post('/hr-admins/:id/reset-password', [body('password').isLength({ min: 6 })], validateRequest, controller.resetHrAdminPassword);

module.exports = router;
