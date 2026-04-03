const bcrypt = require('bcrypt');
const prisma = require('../db/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendMail, sendWelcomeEmail } = require('../services/mailService');

const getDashboardStats = catchAsync(async (req, res) => {
  const organizationCount = await prisma.organization.count();
  const hrAdminCount = await prisma.hrAdmin.count();
  const employeeCount = await prisma.employee.count();
  const enquiryCount = await prisma.enquiry.count();

  res.json({ organizationCount, hrAdminCount, employeeCount, enquiryCount });
});

const getProfile = catchAsync(async (req, res) => {
  const user = await prisma.superAdmin.findUnique({ where: { id: Number(req.user.id) } });
  if (!user) throw new AppError('Super Admin not found', 404);
  res.json(user);
});

const updateProfile = catchAsync(async (req, res) => {
  const payload = req.body;
  const updated = await prisma.superAdmin.update({ where: { id: Number(req.user.id) }, data: payload });
  res.json(updated);
});

const uploadProfilePicture = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file provided', 400);
  const updated = await prisma.superAdmin.update({ where: { id: Number(req.user.id) }, data: { profilePic: req.file.path } });
  res.json({ message: 'Profile picture updated', superAdmin: updated });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.superAdmin.findUnique({ where: { id: Number(req.user.id) } });
  if (!user) throw new AppError('Super Admin not found', 404);

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new AppError('Current password incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.superAdmin.update({ where: { id: Number(req.user.id) }, data: { password: hashed } });
  res.json({ message: 'Password updated' });
});

const getEnquiries = catchAsync(async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  const enquiries = await prisma.enquiry.findMany({ where, orderBy: { submittedDate: 'desc' } });
  res.json(enquiries);
});

const createEnquiry = catchAsync(async (req, res) => {
  const { companyName, hrName, email, phone, employeeSize, message } = req.body;

  const enquiry = await prisma.enquiry.create({
    data: {
      companyName,
      hrName,
      email,
      phone,
      employeeSize: Number(employeeSize),
      message: message || '',
      status: 'pending',
    },
  });

  res.status(201).json(enquiry);
});

const acceptEnquiry = catchAsync(async (req, res) => {
  const { id } = req.params;
  const enquiry = await prisma.enquiry.update({ where: { id: Number(id) }, data: { status: 'accepted', processedAt: new Date() } });
  if (!enquiry) throw new AppError('Enquiry not found', 404);

  const org = await prisma.organization.create({
    data: {
      companyName: enquiry.companyName,
      hrName: enquiry.hrName,
      email: enquiry.email,
      phone: enquiry.phone,
    },
  });

  res.json({ enquiry, organization: org });
});

const rejectEnquiry = catchAsync(async (req, res) => {
  const { id } = req.params;
  const enquiry = await prisma.enquiry.update({ where: { id: Number(id) }, data: { status: 'rejected', processedAt: new Date() } });
  if (!enquiry) throw new AppError('Enquiry not found', 404);
  res.json(enquiry);
});

const getOrganizations = catchAsync(async (req, res) => {
  const organizations = await prisma.organization.findMany({ include: { hrAdmins: true, employees: true } });
  res.json(organizations);
});

const getOrganization = catchAsync(async (req, res) => {
  const { id } = req.params;
  const org = await prisma.organization.findUnique({ where: { id: Number(id) }, include: { hrAdmins: true, employees: true } });
  if (!org) throw new AppError('Organization not found', 404);
  res.json(org);
});

const updateOrganization = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const updated = await prisma.organization.update({ where: { id: Number(id) }, data: payload });
  res.json(updated);
});

const suspendOrganization = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await prisma.organization.update({ where: { id: Number(id) }, data: { status: 'suspended' } });
  res.json(updated);
});

const deleteOrganization = catchAsync(async (req, res) => {
  const { id } = req.params;
  const orgId = Number(id);

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) throw new AppError('Organization not found', 404);

  await prisma.$transaction(async (tx) => {
    const employees = await tx.employee.findMany({ where: { organizationId: orgId }, select: { id: true } });
    const employeeIds = employees.map((e) => e.id);

    if (employeeIds.length > 0) {
      await tx.attendance.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.leaveRequest.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.lateRequest.deleteMany({ where: { employeeId: { in: employeeIds } } });
    }

    await tx.employee.deleteMany({ where: { organizationId: orgId } });
    await tx.hrAdmin.deleteMany({ where: { organizationId: orgId } });
    await tx.holiday.deleteMany({ where: { organizationId: orgId } });
    await tx.attendanceSettings.deleteMany({ where: { organizationId: orgId } });

    await tx.organization.delete({ where: { id: orgId } });
  });

  res.json({ message: 'Organization and related data deleted successfully' });
});

const createHrAdmin = catchAsync(async (req, res) => {
  const { name, email, password, organizationId } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const hrAdmin = await prisma.hrAdmin.create({ data: { name, email, password: hashed, organizationId } });

  // Send email with credentials
  try {
    const emailResult = await sendWelcomeEmail({
      name,
      email,
      password,
      role: 'hr_admin',
      designation: 'HR Administrator',
      department: 'Human Resources',
      phone: null,
    }, 'super_admin');

    if (!emailResult.success) {
      console.error('Failed to send HR admin welcome email:', emailResult.error);
    }
  } catch (emailError) {
    console.error('Failed to send HR admin credentials email:', emailError);
    // Don't fail the request if email fails, but log it
  }

  res.status(201).json(hrAdmin);
});

const listHrAdmins = catchAsync(async (req, res) => {
  const hrAdmins = await prisma.hrAdmin.findMany({ include: { organization: true } });
  res.json(hrAdmins);
});

const updateHrAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const updated = await prisma.hrAdmin.update({ where: { id: Number(id) }, data: payload });
  res.json(updated);
});

const resetHrAdminPassword = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const role = await prisma.hrAdmin.update({ where: { id: Number(id) }, data: { password: hashed } });

  const admin = await prisma.hrAdmin.findUnique({ where: { id: Number(id) } });
  if (admin) {
    await sendWelcomeEmail({
      name: admin.name,
      email: admin.email,
      password,
      role: 'hr_admin',
      designation: 'HR Administrator',
      department: 'Human Resources',
      phone: admin.phone,
    }, 'super_admin');
  }

  res.json({ message: 'Password reset successfully', hrAdmin: role });
});

module.exports = {
  getDashboardStats,
  getEnquiries,
  createEnquiry,
  acceptEnquiry,
  rejectEnquiry,
  getOrganizations,
  getOrganization,
  updateOrganization,
  suspendOrganization,
  deleteOrganization,
  createHrAdmin,
  listHrAdmins,
  updateHrAdmin,
  resetHrAdminPassword,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
};
