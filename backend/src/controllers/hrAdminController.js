const bcrypt = require('bcrypt');
const prisma = require('../db/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendMail, sendWelcomeEmail } = require('../services/mailService');
const { createDateOnly, getCurrentDateString, parseDateFromFrontend, getMonthDateRange } = require('../utils/dateUtils');

const getDashboardStats = catchAsync(async (req, res) => {
  const { organizationId } = req.user;
  const employees = await prisma.employee.count({ where: { organizationId } });
  const attendances = await prisma.attendance.count({ where: { employee: { organizationId } } });
  const leaveRequests = await prisma.leaveRequest.count({ where: { employee: { organizationId } } });
  res.json({ employees, attendances, leaveRequests });
});

const getProfile = catchAsync(async (req, res) => {
  const hr = await prisma.hrAdmin.findUnique({ where: { id: Number(req.user.id) } });
  if (!hr) throw new AppError('HR Admin not found', 404);
  res.json(hr);
});

const updateProfile = catchAsync(async (req, res) => {
  const payload = req.body;
  const updated = await prisma.hrAdmin.update({ where: { id: Number(req.user.id) }, data: payload });
  res.json(updated);
});

const uploadProfilePicture = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file provided', 400);
  const updated = await prisma.hrAdmin.update({ where: { id: Number(req.user.id) }, data: { profilePic: req.file.path } });
  res.json({ message: 'Profile picture updated', hrAdmin: updated });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const hr = await prisma.hrAdmin.findUnique({ where: { id: Number(req.user.id) } });
  if (!hr) throw new AppError('HR Admin not found', 404);

  const match = await bcrypt.compare(currentPassword, hr.password);
  if (!match) throw new AppError('Current password incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.hrAdmin.update({ where: { id: Number(req.user.id) }, data: { password: hashed } });
  res.json({ message: 'Password updated' });
});

const listEmployees = catchAsync(async (req, res) => {
  const { search = '', page = 1, limit = 20, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = { organizationId: req.user.organizationId, AND: [] };

  if (search) {
    where.AND.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (status) where.AND.push({ status });

  if (where.AND.length === 0) delete where.AND;

  const [items, total] = await Promise.all([
    prisma.employee.findMany({ where, skip, take: Number(limit) }),
    prisma.employee.count({ where }),
  ]);

  res.json({ total, page: Number(page), limit: Number(limit), items });
});

const createEmployee = catchAsync(async (req, res) => {
  const { name, email, phone, department, position, role, organizationId, password: rawPassword } = req.body;
  const employeeId = `EMP${Date.now()}`;
  const password = rawPassword && rawPassword.trim().length >= 6 ? rawPassword : `${Math.random().toString(36).substr(2, 8)}A1!`;
  const hashed = await bcrypt.hash(password, 10);

  const employee = await prisma.employee.create({
    data: { name, email, phone, department, position, role, organizationId: organizationId || req.user.organizationId, employeeId, password: hashed },
  });

  await prisma.organization.update({
    where: { id: employee.organizationId },
    data: { currentEmployees: { increment: 1 } },
  });

  // Send email with credentials
  try {
    const emailResult = await sendWelcomeEmail({
      name,
      email,
      password,
      role: 'employee',
      designation: position,
      department,
      phone,
    }, 'hr_admin');

    if (!emailResult.success) {
      console.error('Failed to send employee welcome email:', emailResult.error);
    }
  } catch (emailError) {
    console.error('Failed to send employee credentials email:', emailError);
    // Don't fail the request if email fails, but log it
  }

  res.status(201).json(employee);
});

const updateEmployee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const employee = await prisma.employee.findFirst({ where: { id: Number(id), organizationId: req.user.organizationId } });
  if (!employee) throw new AppError('Employee not found', 404);

  const updated = await prisma.employee.update({ where: { id: Number(id) }, data });
  res.json(updated);
});

const deactivateEmployee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const employeeId = Number(id);
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId: req.user.organizationId },
  });
  if (!employee) throw new AppError('Employee not found', 404);

  await prisma.$transaction(async (tx) => {
    await tx.attendance.deleteMany({ where: { employeeId } });
    await tx.leaveRequest.deleteMany({ where: { employeeId } });
    await tx.lateRequest.deleteMany({ where: { employeeId } });
    await tx.employee.delete({ where: { id: employeeId } });
    await tx.organization.update({
      where: { id: req.user.organizationId },
      data: { currentEmployees: { decrement: 1 } },
    });
  });

  res.json({ message: 'Employee deleted successfully' });
});

const sendCredentials = catchAsync(async (req, res) => {
  const { id } = req.params;
  const employee = await prisma.employee.findUnique({ where: { id: Number(id) } });
  if (!employee) throw new AppError('Employee not found', 404);

  const newPlainPassword = `${Math.random().toString(36).substr(2, 8)}A1!`;
  const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

  await prisma.employee.update({ where: { id: Number(id) }, data: { password: hashedPassword } });

  await sendWelcomeEmail({
    name: employee.name,
    email: employee.email,
    password: newPlainPassword,
    role: 'employee',
    designation: employee.position,
    department: employee.department,
    phone: employee.phone,
  }, 'hr_admin');

  res.json({ message: 'Credentials sent' });
});

const getAttendance = catchAsync(async (req, res) => {
  const { from, to, department, status } = req.query;
  const where = { employee: { organizationId: req.user.organizationId } };

  if (from && to) {
    const fromDate = parseDateFromFrontend(from);
    const toDate = parseDateFromFrontend(to);
    if (fromDate && toDate) {
      where.date = { gte: fromDate, lte: toDate };
    }
  }
  if (status) where.status = status;
  if (department) where.employee = { ...(where.employee || {}), department };

  const records = await prisma.attendance.findMany({ where, include: { employee: true } });
  res.json(records);
});

const getTodayAttendance = catchAsync(async (req, res) => {
  const today = createDateOnly(new Date());

  const records = await prisma.attendance.findMany({
    where: { date: today, employee: { organizationId: req.user.organizationId } },
    include: { employee: true },
  });
  res.json(records);
});

const getEmployeeAttendance = catchAsync(async (req, res) => {
  const { employeeId } = req.params;
  const employee = await prisma.employee.findUnique({ where: { id: Number(employeeId) } });
  if (!employee) throw new AppError('Employee not found', 404);
  const attendance = await prisma.attendance.findMany({ where: { employeeId: Number(employeeId) } });
  res.json(attendance);
});

const editAttendance = catchAsync(async (req, res) => {
  const { id } = req.params;
  const record = await prisma.attendance.update({ where: { id: Number(id) }, data: req.body });
  res.json(record);
});

const getLeaveRequests = catchAsync(async (req, res) => {
  const { status } = req.query;
  const where = { employee: { organizationId: req.user.organizationId } };
  if (status) where.status = status;
  const requests = await prisma.leaveRequest.findMany({ where, include: { employee: true } });
  res.json(requests);
});

const approveLeave = catchAsync(async (req, res) => {
  const { id } = req.params;
  const leave = await prisma.leaveRequest.update({ where: { id: Number(id) }, data: { status: 'approved', approvedBy: req.user.id, approvedAt: new Date() } });
  res.json(leave);
});

const rejectLeave = catchAsync(async (req, res) => {
  const { id } = req.params;
  const leave = await prisma.leaveRequest.update({ where: { id: Number(id) }, data: { status: 'rejected', approvedBy: req.user.id, approvedAt: new Date() } });
  res.json(leave);
});

const getLateRequests = catchAsync(async (req, res) => {
  const { status } = req.query;
  const where = { employee: { organizationId: req.user.organizationId } };
  if (status) where.status = status;
  const requests = await prisma.lateRequest.findMany({ where, include: { employee: true } });
  res.json(requests);
});

const approveLate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const late = await prisma.lateRequest.update({ where: { id: Number(id) }, data: { status: 'approved', approvedBy: req.user.id, approvedAt: new Date() } });
  res.json(late);
});

const rejectLate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const late = await prisma.lateRequest.update({ where: { id: Number(id) }, data: { status: 'rejected', approvedBy: req.user.id, approvedAt: new Date() } });
  res.json(late);
});

const getHolidays = catchAsync(async (req, res) => {
  const holidays = await prisma.holiday.findMany({ where: { organizationId: req.user.organizationId } });
  res.json(holidays);
});

const addHoliday = catchAsync(async (req, res) => {
  const { name, date } = req.body;
  const parsedDate = parseDateFromFrontend(date);
  if (!parsedDate) {
    throw new AppError('Invalid date format for holiday', 400);
  }
  const holiday = await prisma.holiday.create({ data: { name, date: parsedDate, organizationId: req.user.organizationId } });
  res.status(201).json(holiday);
});

const deleteHoliday = catchAsync(async (req, res) => {
  const { id } = req.params;
  await prisma.holiday.delete({ where: { id: Number(id) } });
  res.json({ message: 'Holiday deleted' });
});

const getSettings = catchAsync(async (req, res) => {
  const settings = await prisma.attendanceSettings.findUnique({ where: { organizationId: req.user.organizationId } });
  res.json(settings);
});

const updateSettings = catchAsync(async (req, res) => {
  const numOrNull = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const data = {
    officeStart: req.body.officeStart,
    officeEnd: req.body.officeEnd,
    graceTime: Number(req.body.graceTime) || 0,
    workHours: Number(req.body.workHours) || 0,
    lateThreshold: req.body.lateThreshold || '09:15',
  };
  if (Object.prototype.hasOwnProperty.call(req.body, 'locationLat')) {
    data.locationLat = numOrNull(req.body.locationLat);
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'locationLng')) {
    data.locationLng = numOrNull(req.body.locationLng);
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'locationRadius')) {
    data.locationRadius = numOrNull(req.body.locationRadius);
  }

  const settings = await prisma.attendanceSettings.upsert({
    where: { organizationId: req.user.organizationId },
    create: { ...data, organizationId: req.user.organizationId },
    update: data,
  });
  res.json(settings);
});

const getMonthlyReport = catchAsync(async (req, res) => {
  const { month, year } = req.query;
  const { startDate, endDate } = getMonthDateRange(Number(year), Number(month));
  const attendance = await prisma.attendance.findMany({ where: { date: { gte: startDate, lte: endDate }, employee: { organizationId: req.user.organizationId } } });
  res.json({ month, year, data: attendance });
});

const exportAttendance = catchAsync(async (req, res) => {
  const records = await prisma.attendance.findMany({ where: { employee: { organizationId: req.user.organizationId } }, include: { employee: true } });
  const csv = records.map((item) => `${item.id},${item.employeeId},${item.date.toISOString()},${item.status}`).join('\n');
  res.header('Content-Type', 'text/csv');
  res.attachment('attendance.csv');
  res.send(`id,employeeId,date,status\n${csv}`);
});

module.exports = {
  getDashboardStats,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  listEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  sendCredentials,
  getAttendance,
  getTodayAttendance,
  getEmployeeAttendance,
  editAttendance,
  getLeaveRequests,
  approveLeave,
  rejectLeave,
  getLateRequests,
  approveLate,
  rejectLate,
  getHolidays,
  addHoliday,
  deleteHoliday,
  getSettings,
  updateSettings,
  getMonthlyReport,
  exportAttendance,
};
