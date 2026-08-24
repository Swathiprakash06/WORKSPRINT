const bcrypt = require('bcrypt');
const XLSX = require('xlsx');
const prisma = require('../db/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendMail, sendWelcomeEmail } = require('../services/mailService');
const { processSalaryCredit, formatDateLabel } = require('../services/salaryService');
const { clearSalaryNotificationsForDate, createNotification, createHrNotification, notifyOrganizationEmployees } = require('../services/notificationService');
const { createDateOnly, getCurrentDateString, parseDateFromFrontend, getMonthDateRange } = require('../utils/dateUtils');
const { calculatePerDaySalary } = require('../utils/salaryUtils');

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
  const { name, email, phone, department, position, organizationId, password: rawPassword, monthlySalary, state } = req.body;
  const employeeId = `EMP${Date.now()}`;
  const password = rawPassword && rawPassword.trim().length >= 6 ? rawPassword : `${Math.random().toString(36).substr(2, 8)}A1!`;
  const hashed = await bcrypt.hash(password, 10);

  const salaryValue = monthlySalary != null && monthlySalary !== '' ? Number(monthlySalary) : null;

  const employee = await prisma.employee.create({
    data: {
      name,
      email,
      phone,
      department,
      position,
      state: state?.trim() || null,
      monthlySalary: Number.isFinite(salaryValue) ? salaryValue : null,
      organizationId: organizationId || req.user.organizationId,
      employeeId,
      password: hashed,
    },
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
      designation: position,
      department,
      phone,
    });

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
  const allowedFields = ['name', 'email', 'phone', 'department', 'position', 'status', 'monthlySalary', 'state'];
  const data = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      data[field] = req.body[field];
    }
  });

  if (Object.prototype.hasOwnProperty.call(data, 'monthlySalary')) {
    const salaryValue = data.monthlySalary != null && data.monthlySalary !== ''
      ? Number(data.monthlySalary)
      : null;
    data.monthlySalary = Number.isFinite(salaryValue) ? salaryValue : null;
  }

  const employee = await prisma.employee.findFirst({
    where: { id: Number(id), organizationId: req.user.organizationId },
  });
  if (!employee) throw new AppError('Employee not found', 404);

  try {
    const updated = await prisma.employee.update({ where: { id: Number(id) }, data });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2022') {
      throw new AppError(
        'Database schema is out of date. Run prisma migrate deploy on the server, then retry.',
        503
      );
    }
    throw err;
  }
});

const deactivateEmployee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const employeeId = Number(id);
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId: req.user.organizationId },
  });
  if (!employee) throw new AppError('Employee not found', 404);

  await prisma.$transaction(async (tx) => {
    await tx.dailySalaryCredit.deleteMany({ where: { employeeId } });
    await tx.notification.deleteMany({ where: { employeeId } });
    await tx.employeeQuery.deleteMany({ where: { employeeId } });
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
    designation: employee.position,
    department: employee.department,
    phone: employee.phone,
  });

  res.json({ message: 'Credentials sent' });
});

const resetEmployeePassword = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || password.trim().length === 0) {
    throw new AppError('Password is required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const employee = await prisma.employee.findUnique({ where: { id: Number(id) } });
  if (!employee) throw new AppError('Employee not found', 404);

  const hashedPassword = await bcrypt.hash(password, 10);

  const updated = await prisma.employee.update({
    where: { id: Number(id) },
    data: { password: hashedPassword },
    select: { id: true, name: true, email: true }
  });

  res.json({ message: 'Password reset successfully', employee: updated });
});

const getAttendance = catchAsync(async (req, res) => {
  const { from, to, department, status, includeTest } = req.query;
  const where = { employee: { organizationId: req.user.organizationId } };

  if (includeTest !== 'true') {
    where.isTest = false;
  }

  if (from && to) {
    const fromDate = parseDateFromFrontend(from);
    const toDate = parseDateFromFrontend(to);
    if (fromDate && toDate) {
      where.date = { gte: fromDate, lte: toDate };
    }
  }
  if (status) where.status = status;
  if (department) where.employee = { ...(where.employee || {}), department };

  const records = await prisma.attendance.findMany({
    where,
    include: {
      employee: true,
    },
    orderBy: { date: 'desc' },
  });

  const employeeIds = [...new Set(records.map((r) => r.employeeId))];
  const credits = await prisma.dailySalaryCredit.findMany({
    where: {
      employeeId: { in: employeeIds },
      ...(includeTest !== 'true' ? { isTest: false } : {}),
    },
  });

  const creditMap = new Map(
    credits.map((c) => [`${c.employeeId}_${c.date.toISOString().split('T')[0]}_${c.isTest}`, c])
  );

  const enriched = records.map((record) => {
    const dateKey = record.date.toISOString().split('T')[0];
    const credit = creditMap.get(`${record.employeeId}_${dateKey}_${record.isTest}`);
    return {
      ...record,
      salaryCredited: !!credit,
      salaryAmount: credit?.amountCredited ?? null,
      hoursWorked: record.totalHours ?? 0,
    };
  });

  res.json(enriched);
});

const getTodayAttendance = catchAsync(async (req, res) => {
  // Accept optional `date` query in YYYY-MM-DD. Defaults to today.
  const { includeTest } = req.query;
  const dateOnly = parseAttendanceDate(req.query.date);

  // Fetch active employees for the organization
  const employees = await prisma.employee.findMany({ where: { organizationId: req.user.organizationId, status: 'active' } });

  // Fetch any real attendance records for the date
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      date: dateOnly,
      ...(includeTest !== 'true' ? { isTest: false } : {}),
      employee: { organizationId: req.user.organizationId },
    },
    include: { employee: true },
  });

  const employeeIds = attendanceRecords.map((r) => r.employeeId);

  // Fetch salary credits for the date
  const credits = await prisma.dailySalaryCredit.findMany({
    where: {
      employeeId: { in: employeeIds.length ? employeeIds : [-1] },
      date: dateOnly,
      ...(includeTest !== 'true' ? { isTest: false } : {}),
    },
  });

  const creditMap = new Map(credits.map((c) => [`${c.employeeId}_${c.isTest}`, c]));

  // Fetch approved leave requests for the date so we can mark those as leave instead of absent
  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: { date: dateOnly, status: 'approved', employee: { organizationId: req.user.organizationId } },
  });
  const leaveSet = new Set(approvedLeaves.map((l) => l.employeeId));

  const attendanceByEmployee = new Map(attendanceRecords.map((r) => [r.employeeId, r]));

  // Build full list: for each active employee, either use record or synthesize absent/leave
  const fullRecords = employees.map((emp) => {
    const rec = attendanceByEmployee.get(emp.id);
    if (rec && !(rec.status === 'absent' && leaveSet.has(emp.id))) {
      const credit = creditMap.get(`${rec.employeeId}_${rec.isTest}`);
      return {
        ...rec,
        employee: rec.employee || emp,
        salaryCredited: !!credit,
        salaryAmount: credit?.amountCredited ?? null,
        hoursWorked: rec.totalHours ?? 0,
      };
    }

    // No attendance record — check for approved leave
    if (leaveSet.has(emp.id)) {
      return {
        id: null,
        employeeId: emp.id,
        employee: emp,
        date: dateOnly,
        status: 'leave',
        totalHours: 0,
        salaryCredited: false,
        salaryAmount: null,
        hoursWorked: 0,
        isSynthetic: true,
      };
    }

    // Mark as absent (synthetic) — this won't create DB records, only for display
    return {
      id: null,
      employeeId: emp.id,
      employee: emp,
      date: dateOnly,
      status: 'absent',
      totalHours: 0,
      salaryCredited: false,
      salaryAmount: null,
      hoursWorked: 0,
      isSynthetic: true,
    };
  });

  const totalEmployees = employees.length;
  const markedCount = fullRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absentCount = fullRecords.filter((r) => r.status === 'absent').length;
  const notMarkedCount = fullRecords.filter((r) => r.isSynthetic).length;

  res.json({
    date: dateOnly,
    totalEmployees,
    markedCount,
    absentCount,
    notMarkedCount,
    records: fullRecords,
  });
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
  const leave = await prisma.leaveRequest.findFirst({
    where: { id: Number(id), employee: { organizationId: req.user.organizationId } },
    include: { employee: { select: { id: true } } },
  });
  if (!leave) throw new AppError('Leave request not found', 404);

  const updated = await prisma.leaveRequest.update({
    where: { id: leave.id },
    data: { status: 'approved', approvedBy: req.user.id, approvedAt: new Date() },
  });
  await prisma.attendance.upsert({
    where: {
      employeeId_date_isTest: {
        employeeId: leave.employeeId,
        date: leave.date,
        isTest: false,
      },
    },
    update: {
      status: 'leave',
      checkInTime: null,
      checkOutTime: null,
      checkInTimestamp: null,
      checkOutTimestamp: null,
      totalHours: 0,
      markedByHr: false,
      hrNote: null,
    },
    create: {
      employeeId: leave.employeeId,
      date: leave.date,
      status: 'leave',
      totalHours: 0,
      isTest: false,
    },
  });
  await createNotification({
    employeeId: leave.employeeId,
    title: 'Leave request approved',
    message: `Your ${leave.type} request for ${formatDateLabel(leave.date)} has been approved.`,
    type: 'success',
    category: 'leave',
    linkPath: '/employee/history',
  });
  res.json(updated);
});

const rejectLeave = catchAsync(async (req, res) => {
  const { id } = req.params;
  const leave = await prisma.leaveRequest.findFirst({
    where: { id: Number(id), employee: { organizationId: req.user.organizationId } },
  });
  if (!leave) throw new AppError('Leave request not found', 404);

  const updated = await prisma.leaveRequest.update({
    where: { id: leave.id },
    data: { status: 'rejected', approvedBy: req.user.id, approvedAt: new Date() },
  });
  await createNotification({
    employeeId: leave.employeeId,
    title: 'Leave request rejected',
    message: `Your ${leave.type} request for ${formatDateLabel(leave.date)} was not approved.`,
    type: 'warning',
    category: 'leave',
    linkPath: '/employee/history',
  });
  res.json(updated);
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
  const { name, dates } = req.body;
  
  if (!Array.isArray(dates) || dates.length === 0) {
    throw new AppError('Dates must be a non-empty array', 400);
  }

  const holidayData = dates.map(date => {
    const parsedDate = parseDateFromFrontend(date);
    if (!parsedDate) {
      throw new AppError(`Invalid date format: ${date}`, 400);
    }
    return { name, date: parsedDate, organizationId: req.user.organizationId };
  });

  await prisma.holiday.createMany({ data: holidayData });

  await Promise.all(holidayData.map((holiday) =>
    notifyOrganizationEmployees({
      organizationId: req.user.organizationId,
      title: 'Holiday announced',
      message: `${name} has been marked as a holiday for ${formatDateLabel(holiday.date)}.`,
      type: 'info',
      category: 'holiday',
      linkPath: '/employee/dashboard',
    })
  ));
  
  // Return all holidays to update the frontend
  const allHolidays = await prisma.holiday.findMany({ 
    where: { organizationId: req.user.organizationId },
    orderBy: { date: 'asc' }
  });
  
  res.status(201).json(allHolidays);
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
  const { includeTest } = req.query;
  const where = { employee: { organizationId: req.user.organizationId } };
  if (includeTest !== 'true') where.isTest = false;

  const records = await prisma.attendance.findMany({
    where,
    include: { employee: true },
    orderBy: { date: 'desc' },
  });

  const credits = await prisma.dailySalaryCredit.findMany({
    where: {
      employeeId: { in: [...new Set(records.map((r) => r.employeeId))] },
      ...(includeTest !== 'true' ? { isTest: false } : {}),
    },
  });

  const creditMap = new Map(
    credits.map((c) => [`${c.employeeId}_${c.date.toISOString().split('T')[0]}_${c.isTest}`, c])
  );

  const rows = records.map((item) => {
    const dateKey = item.date.toISOString().split('T')[0];
    const credit = creditMap.get(`${item.employeeId}_${dateKey}_${item.isTest}`);
    return {
      'Employee Name': item.employee?.name || '',
      'Employee ID': item.employee?.employeeId || '',
      Date: dateKey,
      Status: item.status,
      'Check In': item.checkInTime || '',
      'Check Out': item.checkOutTime || '',
      'Hours Worked': item.totalHours ?? 0,
      'Salary Credited': credit ? 'Yes' : 'No',
      'Salary Amount': credit?.amountCredited ?? '',
      'Test Record': item.isTest ? 'Yes' : 'No',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance-salary-report.xlsx');
  res.send(buffer);
});

const getEmployeeSalaryCredits = catchAsync(async (req, res) => {
  const { employeeId } = req.params;
  const employee = await prisma.employee.findFirst({
    where: { id: Number(employeeId), organizationId: req.user.organizationId },
  });
  if (!employee) throw new AppError('Employee not found', 404);

  const [attendance, credits, approvedLeaves] = await Promise.all([
    prisma.attendance.findMany({
      where: { employeeId: Number(employeeId), isTest: false },
      orderBy: { date: 'asc' },
    }),
    prisma.dailySalaryCredit.findMany({
      where: { employeeId: Number(employeeId), isTest: false },
      orderBy: { date: 'asc' },
    }),
    prisma.leaveRequest.findMany({
      where: { employeeId: Number(employeeId), status: 'approved' },
      orderBy: { date: 'asc' },
    }),
  ]);

  // Create a map of credited dates
  const creditMap = new Map(credits.map((c) => [c.date.toISOString().split('T')[0], c]));

  // Build complete records with salary status
  const leaveByDate = new Map(approvedLeaves.map((leave) => [leave.date.toISOString().split('T')[0], leave]));
  const completeRecords = attendance.map((att) => {
    const dateKey = att.date.toISOString().split('T')[0];
    const credit = creditMap.get(dateKey);
    const leave = leaveByDate.get(dateKey);
    return {
      date: att.date,
      hoursWorked: att.totalHours ?? 0,
      status: leave ? 'leave' : att.status,
      salaryCredited: !!credit,
      amountCredited: credit?.amountCredited ?? null,
    };
  });
  const attendanceDates = new Set(attendance.map((att) => att.date.toISOString().split('T')[0]));
  completeRecords.push(...approvedLeaves
    .filter((leave) => !attendanceDates.has(leave.date.toISOString().split('T')[0]))
    .map((leave) => ({
      date: leave.date,
      hoursWorked: 0,
      status: 'leave',
      salaryCredited: false,
      amountCredited: null,
    })));
  completeRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json({
    employee: {
      id: employee.id,
      name: employee.name,
      monthlySalary: employee.monthlySalary,
    },
    credits: completeRecords,
  });
});

const buildMonthlySalarySummary = async ({ organizationId, employeeId, month, year }) => {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId },
    select: { id: true, employeeId: true, name: true, email: true, monthlySalary: true },
  });
  if (!employee) throw new AppError('Employee not found', 404);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  const dateRange = { gte: startDate, lte: endDate };

  const [attendance, credits, approvedLeave] = await Promise.all([
    prisma.attendance.findMany({
      where: { employeeId, isTest: false, date: dateRange },
      orderBy: { date: 'desc' },
    }),
    prisma.dailySalaryCredit.findMany({
      where: { employeeId, isTest: false, date: dateRange },
      orderBy: { date: 'desc' },
    }),
    prisma.leaveRequest.findMany({
      where: { employeeId, status: 'approved', date: dateRange },
      select: { date: true },
    }),
  ]);

  const dateKey = (date) => new Date(date).toISOString().split('T')[0];
  const creditsByDate = new Map(credits.map((credit) => [dateKey(credit.date), credit]));
  const absentOrLeaveDates = new Set([
    ...attendance.filter((record) => record.status === 'absent').map((record) => dateKey(record.date)),
    ...approvedLeave.map((leave) => dateKey(leave.date)),
  ]);

  const records = attendance.map((record) => {
    const credit = creditsByDate.get(dateKey(record.date));
    return {
      ...record,
      salaryCredited: Boolean(credit),
      salaryAmount: credit?.amountCredited ?? null,
      hoursWorked: record.totalHours ?? 0,
    };
  });

  const summary = {
    employee,
    month,
    year,
    daysPresent: attendance.filter((record) => ['present', 'late'].includes(record.status)).length,
    daysAbsentOrLeave: absentOrLeaveDates.size,
    totalHours: Math.round(attendance.reduce((total, record) => total + (Number(record.totalHours) || 0), 0) * 100) / 100,
    salaryAssigned: employee.monthlySalary ?? 0,
    perDaySalary: calculatePerDaySalary(employee.monthlySalary, year, month),
    salaryCreditedDays: credits.length,
    totalSalary: Math.round(credits.reduce((total, credit) => total + credit.amountCredited, 0) * 100) / 100,
  };

  return { summary, records };
};

const getMonthlySalarySummary = catchAsync(async (req, res) => {
  const { employeeId, month, year } = req.query;
  const data = await buildMonthlySalarySummary({
    organizationId: Number(req.user.organizationId),
    employeeId: Number(employeeId),
    month: Number(month),
    year: Number(year),
  });
  res.json(data);
});

const exportMonthlySalarySummary = catchAsync(async (req, res) => {
  const { employeeId, month, year } = req.query;
  const { summary, records } = await buildMonthlySalarySummary({
    organizationId: Number(req.user.organizationId),
    employeeId: Number(employeeId),
    month: Number(month),
    year: Number(year),
  });

  const summaryRows = [{
    Employee: summary.employee.name,
    'Employee ID': summary.employee.employeeId,
    Month: new Date(summary.year, summary.month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    'Days Present': summary.daysPresent,
    'Days Absent / Leave': summary.daysAbsentOrLeave,
    'Total Hours': summary.totalHours,
    'Salary Assigned': summary.salaryAssigned,
    'Salary Credited Days': summary.salaryCreditedDays,
    'Total Salary Obtained': summary.totalSalary,
  }];
  const dailyRows = records.map((record) => ({
    Date: dateKeyForExport(record.date),
    'Check In': record.checkInTime || '',
    'Check Out': record.checkOutTime || '',
    Hours: record.hoursWorked,
    Status: record.status,
    'Salary Credited': record.salaryCredited ? 'Yes' : 'No',
    Amount: record.salaryAmount ?? '',
    Source: record.markedByHr ? 'HR Marked' : 'Self',
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), 'Monthly Summary');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dailyRows), 'Daily Attendance');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=monthly-salary-summary-${summary.employee.employeeId}-${year}-${String(month).padStart(2, '0')}.xlsx`);
  res.send(buffer);
});

const dateKeyForExport = (date) => new Date(date).toISOString().split('T')[0];

const getNotifications = catchAsync(async (req, res) => {
  const notifications = await prisma.hrAdminNotification.findMany({
    where: { organizationId: Number(req.user.organizationId) },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(notifications);
});

const markNotificationRead = catchAsync(async (req, res) => {
  const notification = await prisma.hrAdminNotification.findFirst({
    where: { id: Number(req.params.id), organizationId: Number(req.user.organizationId) },
  });
  if (!notification) throw new AppError('Notification not found', 404);

  const updated = await prisma.hrAdminNotification.update({
    where: { id: notification.id },
    data: { isRead: true },
  });
  res.json(updated);
});

const markAllNotificationsRead = catchAsync(async (req, res) => {
  const result = await prisma.hrAdminNotification.updateMany({
    where: { organizationId: Number(req.user.organizationId), isRead: false },
    data: { isRead: true },
  });
  res.json({ updated: result.count });
});

const simulateAttendance = catchAsync(async (req, res) => {
  const { employeeId, date, hours, status = 'present' } = req.body;
  if (!employeeId || hours == null) {
    throw new AppError('employeeId and hours are required', 400);
  }

  const employee = await prisma.employee.findFirst({
    where: { id: Number(employeeId), organizationId: req.user.organizationId },
  });
  if (!employee) throw new AppError('Employee not found', 404);

  let dateOnly;
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    dateOnly = createDateOnly(date);
  } else {
    dateOnly = createDateOnly(new Date());
  }

  const totalHours = Math.round(Number(hours) * 100) / 100;
  if (!Number.isFinite(totalHours) || totalHours < 0) {
    throw new AppError('Invalid hours value', 400);
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      employeeId_date_isTest: { employeeId: Number(employeeId), date: dateOnly, isTest: true },
    },
    update: {
      status,
      totalHours,
      checkInTime: '09:00',
      checkOutTime: '18:00',
      checkInTimestamp: new Date(),
      checkOutTimestamp: new Date(),
    },
    create: {
      employeeId: Number(employeeId),
      date: dateOnly,
      status,
      totalHours,
      checkInTime: '09:00',
      checkOutTime: '18:00',
      checkInTimestamp: new Date(),
      checkOutTimestamp: new Date(),
      isTest: true,
    },
  });

  // Clear stale salary notifications from prior test runs for this date (QA only)
  await clearSalaryNotificationsForDate(Number(employeeId), formatDateLabel(dateOnly));

  const salaryResult = await processSalaryCredit({
    employeeId: Number(employeeId),
    attendanceDate: dateOnly,
    totalHours,
    isTest: true,
  });

  res.status(201).json({ attendance, salary: salaryResult, isTest: true });
});

const parseAttendanceDate = (date) => {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return createDateOnly(date);
  }
  return createDateOnly(new Date());
};

/** HR marks real attendance when employee forgot to check in/out — visible to employee & payroll. */
const manualMarkAttendance = catchAsync(async (req, res) => {
  const employeeId = Number(req.body.employeeId);
  const { date, note } = req.body;
  const hours = req.body.hours;

  if (!employeeId || hours == null) {
    throw new AppError('employeeId and hours are required', 400);
  }

  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId: req.user.organizationId },
  });
  if (!employee) throw new AppError('Employee not found', 404);

  const settings = await prisma.attendanceSettings.findUnique({
    where: { organizationId: req.user.organizationId },
    select: { officeStart: true, officeEnd: true },
  });
  const officeStart = settings?.officeStart || '09:00';
  const officeEnd = settings?.officeEnd || '18:00';

  const dateOnly = parseAttendanceDate(date);
  const totalHours = Math.round(Number(hours) * 100) / 100;
  if (!Number.isFinite(totalHours) || totalHours < 0) {
    throw new AppError('Invalid hours value', 400);
  }

  const now = new Date();
  let attendance;
  try {
    attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date_isTest: { employeeId, date: dateOnly, isTest: false },
      },
      update: {
        status: 'present',
        totalHours,
        checkInTime: officeStart,
        checkOutTime: officeEnd,
        checkInTimestamp: now,
        checkOutTimestamp: now,
        markedByHr: true,
        hrNote: note?.trim() || null,
      },
      create: {
        employeeId,
        date: dateOnly,
        status: 'present',
        totalHours,
        checkInTime: officeStart,
        checkOutTime: officeEnd,
        checkInTimestamp: now,
        checkOutTimestamp: now,
        isTest: false,
        markedByHr: true,
        hrNote: note?.trim() || null,
      },
    });
  } catch (err) {
    if (err.code === 'P2022') {
      throw new AppError(
        'Database is missing HR attendance columns. Run: npx prisma migrate deploy && npx prisma generate, then restart the backend.',
        503
      );
    }
    if (err.message?.includes('Unknown arg `markedByHr`')) {
      throw new AppError(
        'Backend needs a restart after schema update. Stop the server, run npx prisma generate, then npm run dev.',
        503
      );
    }
    throw err;
  }

  const salaryResult = await processSalaryCredit({
    employeeId,
    attendanceDate: dateOnly,
    totalHours,
    isTest: false,
    hrMarked: true,
  });

  res.status(201).json({
    attendance: {
      id: attendance.id,
      employeeId: attendance.employeeId,
      date: attendance.date,
      status: attendance.status,
      totalHours: attendance.totalHours,
      markedByHr: attendance.markedByHr,
      hrNote: attendance.hrNote,
    },
    salary: salaryResult,
  });
});

const listEmployeeQueries = catchAsync(async (req, res) => {
  const { organizationId } = req.user;
  const status = req.query.status;

  const where = {
    employee: { organizationId },
    ...(status && status !== 'all' ? { status } : {}),
  };

  const queries = await prisma.employeeQuery.findMany({
    where,
    include: {
      employee: {
        select: { id: true, name: true, email: true, employeeId: true, department: true },
      },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  res.json(queries);
});

const respondToEmployeeQuery = catchAsync(async (req, res) => {
  const { organizationId, id: hrAdminId } = req.user;
  const queryId = Number(req.params.id);
  const { response, status } = req.body;

  const trimmedResponse = String(response ?? '').trim();
  if (!trimmedResponse) throw new AppError('Response is required', 400);

  const existing = await prisma.employeeQuery.findFirst({
    where: { id: queryId, employee: { organizationId } },
    include: { employee: { select: { id: true, name: true } } },
  });
  if (!existing) throw new AppError('Query not found', 404);

  const newStatus = status === 'closed' ? 'closed' : 'answered';

  const updated = await prisma.employeeQuery.update({
    where: { id: queryId },
    data: {
      hrResponse: trimmedResponse,
      status: newStatus,
      respondedBy: hrAdminId,
      respondedAt: new Date(),
    },
    include: {
      employee: {
        select: { id: true, name: true, email: true, employeeId: true, department: true },
      },
    },
  });

  await createNotification({
    employeeId: existing.employeeId,
    title: 'HR responded to your query',
    message: `Your query "${existing.subject}" has been answered by HR.`,
    type: 'info',
    category: 'query',
    linkPath: '/employee/queries',
  });

  res.json(updated);
});

const listAdminQueries = catchAsync(async (req, res) => {
  const queries = await prisma.adminQuery.findMany({
    where: { organizationId: req.user.organizationId },
    include: { hrAdmin: { select: { id: true, name: true, email: true } }, organization: { select: { id: true, companyName: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(queries);
});

const createAdminQuery = catchAsync(async (req, res) => {
  const subject = String(req.body.subject ?? '').trim();
  const message = String(req.body.message ?? '').trim();
  if (!subject || !message) throw new AppError('Subject and message are required', 400);

  const query = await prisma.adminQuery.create({
    data: {
      organizationId: req.user.organizationId,
      hrAdminId: req.user.id,
      senderRole: 'hrAdmin',
      subject,
      message,
    },
    include: { hrAdmin: { select: { id: true, name: true, email: true } }, organization: { select: { id: true, companyName: true } } },
  });
  res.status(201).json(query);
});

const respondToAdminQuery = catchAsync(async (req, res) => {
  const response = String(req.body.response ?? '').trim();
  if (!response) throw new AppError('Response is required', 400);
  const query = await prisma.adminQuery.findFirst({ where: { id: Number(req.params.id), organizationId: req.user.organizationId } });
  if (!query) throw new AppError('Admin query not found', 404);

  const updated = await prisma.adminQuery.update({
    where: { id: query.id },
    data: { response, status: req.body.status === 'closed' ? 'closed' : 'answered', respondedByRole: 'hrAdmin', respondedById: req.user.id, respondedAt: new Date() },
    include: { hrAdmin: { select: { id: true, name: true, email: true } }, organization: { select: { id: true, companyName: true } } },
  });
  res.json(updated);
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
  resetEmployeePassword,
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
  getEmployeeSalaryCredits,
  getMonthlySalarySummary,
  exportMonthlySalarySummary,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  simulateAttendance,
  manualMarkAttendance,
  listEmployeeQueries,
  respondToEmployeeQuery,
  listAdminQueries,
  createAdminQuery,
  respondToAdminQuery,
};
