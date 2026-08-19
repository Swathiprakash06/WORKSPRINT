const bcrypt = require('bcrypt');
const XLSX = require('xlsx');
const prisma = require('../db/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { isWithinRadius } = require('../services/locationService');
const { createHrNotification } = require('../services/notificationService');
const { createDateOnly, getCurrentDateString, getCurrentTimeString, isLate, parseDateFromFrontend } = require('../utils/dateUtils');

const minutesFromHHMM = (hhmm) => {
  if (!hhmm || typeof hhmm !== 'string') return 0;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
};

const getProfile = catchAsync(async (req, res) => {
  const user = await prisma.employee.findUnique({ where: { id: Number(req.user.id) } });
  if (!user) throw new AppError('Employee not found', 404);
  res.json(user);
});

const updateProfile = catchAsync(async (req, res) => {
  const id = Number(req.user.id);
  const data = {};

  if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
    const trimmed = String(req.body.name ?? '').trim();
    if (!trimmed) throw new AppError('Name is required', 400);
    data.name = trimmed;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) {
    const digits = String(req.body.phone ?? '').replace(/\D/g, '');
    if (digits.length < 10) throw new AppError('Phone must contain at least 10 digits', 400);
    data.phone = digits;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'employeeId')) {
    const trimmed = String(req.body.employeeId ?? '').trim();
    if (!trimmed) throw new AppError('Employee ID is required', 400);
    if (trimmed.length > 50) throw new AppError('Employee ID must be 50 characters or less', 400);

    const taken = await prisma.employee.findFirst({
      where: { employeeId: trimmed, NOT: { id } },
    });
    if (taken) throw new AppError('This Employee ID is already in use', 409);

    data.employeeId = trimmed;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  try {
    const updated = await prisma.employee.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2002') throw new AppError('This Employee ID is already in use', 409);
    throw err;
  }
});

const uploadProfilePicture = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file provided', 400);
  const employee = await prisma.employee.update({
    where: { id: Number(req.user.id) },
    data: { profilePic: req.file.path },
  });
  res.json({ message: 'Profile picture updated', employee });
});

const checkIn = catchAsync(async (req, res) => {
  const { latitude, longitude, lateReason, checkInTime, date: clientDate } = req.body;
  const employee = await prisma.employee.findUnique({ where: { id: Number(req.user.id) } });
  if (!employee) throw new AppError('Employee not found', 404);

  const settings = await prisma.attendanceSettings.findUnique({ where: { organizationId: employee.organizationId } });
  if (
    settings?.locationLat == null ||
    settings?.locationLng == null ||
    settings?.locationRadius == null ||
    !Number(settings.locationRadius)
  ) {
    console.warn('Location settings not configured; allowing check-in without geofence.');
  } else {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new AppError('Valid GPS coordinates are required for check-in at this organization', 400);
    }
    if (
      !isWithinRadius(lat, lng, settings.locationLat, settings.locationLng, settings.locationRadius)
    ) {
      throw new AppError('You are outside the allowed check-in location', 400);
    }
  }

  // Use client's date if provided, otherwise calculate
  let dateOnly;
  if (clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)) {
    const [year, month, day] = clientDate.split('-').map(Number);
    dateOnly = new Date(year, month - 1, day);
  } else {
    const today = new Date();
    dateOnly = createDateOnly(today);
  }

  // Use client's time if provided, otherwise use server time
  const currentTime = checkInTime || getCurrentTimeString();

  const officeStart = settings?.officeStart || '09:00';
  const graceTime = settings?.graceTime ?? 15;
  const lateByPolicy = isLate(currentTime, officeStart, graceTime);
  if (lateByPolicy) {
    const trimmed = lateReason != null ? String(lateReason).trim() : '';
    if (!trimmed) {
      throw new AppError('Late check-in requires a reason', 400);
    }
  }

  const status = lateByPolicy ? 'late' : 'present';
  const reasonToStore = lateByPolicy ? String(lateReason).trim() : null;
  const today = new Date();

  const attendance = await prisma.attendance.upsert({
    where: { employeeId_date_isTest: { employeeId: employee.id, date: dateOnly, isTest: false } },
    update: {
      checkInTime: currentTime,
      checkInTimestamp: today,
      status,
      lateReason: reasonToStore,
    },
    create: {
      employeeId: employee.id,
      date: dateOnly,
      checkInTime: currentTime,
      checkInTimestamp: today,
      status,
      lateReason: reasonToStore,
    },
  });

  res.json(attendance);
});

const markAbsent = catchAsync(async (req, res) => {
  const employeeId = Number(req.user.id);
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new AppError('Employee not found', 404);

  const dateOnly = parseDateFromFrontend(req.body.date);
  if (!dateOnly) throw new AppError('Invalid attendance date', 400);

  const approvedLeave = await prisma.leaveRequest.findFirst({
    where: { employeeId, date: dateOnly, status: 'approved' },
  });
  if (approvedLeave) throw new AppError('Approved leave cannot be marked absent', 400);

  const attendance = await prisma.attendance.upsert({
    where: { employeeId_date_isTest: { employeeId, date: dateOnly, isTest: false } },
    update: {
      status: 'absent',
      checkInTime: null,
      checkOutTime: null,
      checkInTimestamp: null,
      checkOutTimestamp: null,
      totalHours: 0,
      lateReason: null,
      earlyCheckoutReason: null,
      markedByHr: false,
      hrNote: null,
    },
    create: {
      employeeId,
      date: dateOnly,
      status: 'absent',
      totalHours: 0,
      isTest: false,
    },
  });

  res.json(attendance);
});

const { processSalaryCredit } = require('../services/salaryService');
const { SALARY_NOTIFICATION_TITLES } = require('../services/notificationService');

const checkOut = catchAsync(async (req, res) => {
  const { latitude, longitude, earlyCheckoutReason, checkOutTime, date: clientDate, manualHours } = req.body;
  const employee = await prisma.employee.findUnique({ where: { id: Number(req.user.id) } });
  if (!employee) throw new AppError('Employee not found', 404);

  const settings = await prisma.attendanceSettings.findUnique({ where: { organizationId: employee.organizationId } });
  if (
    settings?.locationLat == null ||
    settings?.locationLng == null ||
    settings?.locationRadius == null ||
    !Number(settings.locationRadius)
  ) {
    console.warn('Location settings not configured; allowing check-out without geofence.');
  } else {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new AppError('Valid GPS coordinates are required for check-out at this organization', 400);
    }
    if (
      !isWithinRadius(lat, lng, settings.locationLat, settings.locationLng, settings.locationRadius)
    ) {
      throw new AppError('You are outside the allowed check-out location', 400);
    }
  }

  // Use client's date if provided, otherwise calculate
  let dateOnly;
  if (clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)) {
    const [year, month, day] = clientDate.split('-').map(Number);
    dateOnly = new Date(year, month - 1, day);
  } else {
    const today = new Date();
    dateOnly = createDateOnly(today);
  }

  // Use client's time if provided, otherwise use server time
  const currentTime = checkOutTime || getCurrentTimeString();

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date_isTest: { employeeId: employee.id, date: dateOnly, isTest: false } },
  });
  if (!existing) throw new AppError('Check in first', 400);

  const officeEnd = settings?.officeEnd || '18:00';
  const isEarlyCheckout = minutesFromHHMM(currentTime) < minutesFromHHMM(officeEnd);
  if (isEarlyCheckout) {
    const trimmed = earlyCheckoutReason != null ? String(earlyCheckoutReason).trim() : '';
    if (!trimmed) {
      throw new AppError('Early check-out requires a reason (before official office end time)', 400);
    }
  }

  const checkInDate = existing.checkInTimestamp || new Date();
  const today = new Date();
  let totalHours;
  if (manualHours != null && Number.isFinite(Number(manualHours))) {
    totalHours = Math.round(Number(manualHours) * 100) / 100;
  } else {
    const diffMs = today - checkInDate;
    totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }

  const attendance = await prisma.attendance.update({
    where: { id: existing.id },
    data: {
      checkOutTime: currentTime,
      checkOutTimestamp: today,
      totalHours,
      earlyCheckoutReason: isEarlyCheckout ? String(earlyCheckoutReason).trim() : null,
    },
  });

  const salaryResult = await processSalaryCredit({
    employeeId: employee.id,
    attendanceDate: dateOnly,
    totalHours,
    isTest: false,
  });

  res.json({ attendance, salary: salaryResult });
});

const getAttendanceHistory = catchAsync(async (req, res) => {
  const [attendance, approvedLeaves] = await Promise.all([
    prisma.attendance.findMany({ where: { employeeId: Number(req.user.id) }, orderBy: { date: 'asc' } }),
    prisma.leaveRequest.findMany({ where: { employeeId: Number(req.user.id), status: 'approved' }, orderBy: { date: 'asc' } }),
  ]);
  const leaveByDate = new Map(approvedLeaves.map((leave) => [leave.date.toISOString().split('T')[0], leave]));
  const records = attendance.map((record) => (
    leaveByDate.has(record.date.toISOString().split('T')[0])
      ? { ...record, status: 'leave', totalHours: 0, checkInTime: null, checkOutTime: null }
      : record
  ));
  const attendanceDates = new Set(attendance.map((record) => record.date.toISOString().split('T')[0]));
  records.push(...approvedLeaves
    .filter((leave) => !attendanceDates.has(leave.date.toISOString().split('T')[0]))
    .map((leave) => ({
      id: `leave_${leave.id}`,
      employeeId: Number(req.user.id),
      date: leave.date,
      status: 'leave',
      totalHours: 0,
      checkInTime: null,
      checkOutTime: null,
    })));
  records.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(records);
});

const getMonthlySummary = catchAsync(async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const records = await prisma.attendance.findMany({ where: { employeeId: Number(req.user.id), date: { gte: start, lte: end } } });
  res.json(records);
});

const submitLeaveRequest = catchAsync(async (req, res) => {
  const data = req.body;
  const parsedDate = parseDateFromFrontend(data.date);
  if (!parsedDate) {
    throw new AppError('Invalid date format for leave request', 400);
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: Number(req.user.id),
      type: data.type,
      date: parsedDate,
      reason: data.reason,
      status: 'pending',
    },
  });

  const employee = await prisma.employee.findUnique({ where: { id: Number(req.user.id) } });
  if (employee) {
    await createHrNotification({
      organizationId: employee.organizationId,
      title: 'New leave request',
      message: `${employee.name} submitted a ${data.type || 'leave'} request for ${parsedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`,
      type: 'info',
      category: 'leave',
      linkPath: '/hradmin/requests-management',
    });
  }

  res.status(201).json(leave);
});

const submitLeaveRequestsBatch = catchAsync(async (req, res) => {
  const { type, reason, dates } = req.body;
  if (!Array.isArray(dates) || dates.length === 0) {
    throw new AppError('Provide at least one leave date', 400);
  }
  if (!reason || !String(reason).trim()) {
    throw new AppError('Reason is required', 400);
  }

  const employeeId = Number(req.user.id);
  const trimmedReason = String(reason).trim();
  const requestType = type && String(type).trim() ? String(type).trim() : 'Leave';

  const parsedDates = [];
  for (const d of dates) {
    const parsedDate = parseDateFromFrontend(typeof d === 'string' ? d : String(d));
    if (!parsedDate) {
      throw new AppError(`Invalid date: ${d}`, 400);
    }
    parsedDates.push(parsedDate);
  }

  const leaves = await prisma.$transaction(
    parsedDates.map((parsedDate) =>
      prisma.leaveRequest.create({
        data: {
          employeeId,
          type: requestType,
          date: parsedDate,
          reason: trimmedReason,
          status: 'pending',
        },
      })
    )
  );

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (employee) {
    const dateLabels = parsedDates
      .map((d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }))
      .join(', ');
    await createHrNotification({
      organizationId: employee.organizationId,
      title: 'New leave request',
      message: `${employee.name} submitted ${parsedDates.length} leave day(s): ${dateLabels}.`,
      type: 'info',
      category: 'leave',
      linkPath: '/hradmin/requests-management',
    });
  }

  res.status(201).json(leaves);
});

const getMyLeaveRequests = catchAsync(async (req, res) => {
  const requests = await prisma.leaveRequest.findMany({ where: { employeeId: Number(req.user.id) } });
  res.json(requests);
});

const submitLateRequest = catchAsync(async (req, res) => {
  const data = req.body;
  const parsedDate = parseDateFromFrontend(data.date);
  if (!parsedDate) {
    throw new AppError('Invalid date format for late request', 400);
  }

  const late = await prisma.lateRequest.create({
    data: {
      employeeId: Number(req.user.id),
      date: parsedDate,
      reason: data.reason,
      checkInTime: data.checkInTime || null,
      status: 'pending',
    },
  });

  const employee = await prisma.employee.findUnique({ where: { id: Number(req.user.id) } });
  if (employee) {
    await createHrNotification({
      organizationId: employee.organizationId,
      title: 'New late regularization request',
      message: `${employee.name} submitted a late regularization request for ${parsedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`,
      type: 'info',
      category: 'leave',
      linkPath: '/hradmin/requests-management',
    });
  }

  res.status(201).json(late);
});

const getMyLateRequests = catchAsync(async (req, res) => {
  const requests = await prisma.lateRequest.findMany({ where: { employeeId: Number(req.user.id) } });
  res.json(requests);
});

const getDashboard = catchAsync(async (req, res) => {
  const days = await prisma.attendance.count({ where: { employeeId: Number(req.user.id), status: 'present' } });
  const leave = await prisma.leaveRequest.count({ where: { employeeId: Number(req.user.id), status: 'approved' } });
  const late = await prisma.lateRequest.count({ where: { employeeId: Number(req.user.id), status: 'approved' } });

  res.json({ daysPresent: days, leavesApproved: leave, lateApproved: late });
});

const exportAttendance = catchAsync(async (req, res) => {
  const employeeId = Number(req.user.id);
  const [attendance, leaveRequests] = await Promise.all([
    prisma.attendance.findMany({
      where: { employeeId, isTest: false },
      orderBy: { date: 'asc' },
    }),
    prisma.leaveRequest.findMany({
      where: { employeeId, status: 'approved' },
      orderBy: { date: 'asc' },
    }),
  ]);

  const leaveMap = new Map(leaveRequests.map((leave) => [new Date(leave.date).toISOString().split('T')[0], leave]));
  const rows = attendance.map((entry) => {
    const dateKey = new Date(entry.date).toISOString().split('T')[0];
    const leaveEntry = leaveMap.get(dateKey);
    return {
      Date: dateKey,
      Status: leaveEntry ? 'Approved Leave' : (entry.status || 'Absent'),
      'Check In': entry.checkInTime || '-',
      'Check Out': entry.checkOutTime || '-',
      'Hours Worked': entry.totalHours ?? 0,
      Note: leaveEntry ? `Approved leave: ${leaveEntry.reason || 'N/A'}` : (entry.lateReason || entry.earlyCheckoutReason || entry.hrNote || '-'),
    };
  });

  const leaveOnlyDates = leaveRequests
    .filter((leave) => !attendance.some((entry) => new Date(entry.date).toISOString().split('T')[0] === new Date(leave.date).toISOString().split('T')[0]))
    .map((leave) => {
      const dateKey = new Date(leave.date).toISOString().split('T')[0];
      return {
        Date: dateKey,
        Status: 'Approved Leave',
        'Check In': '-',
        'Check Out': '-',
        'Hours Worked': 0,
        Note: `Approved leave: ${leave.reason || 'N/A'}`,
      };
    });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet([...rows, ...leaveOnlyDates]);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=attendance-${employeeId}.xlsx`);
  res.send(buffer);
});

const getHolidays = catchAsync(async (req, res) => {
  const employee = await prisma.employee.findUnique({ where: { id: Number(req.user.id) } });
  if (!employee) throw new AppError('Employee not found', 404);
  const holidays = await prisma.holiday.findMany({ where: { organizationId: employee.organizationId } });
  res.json(holidays);
});

const getSettings = catchAsync(async (req, res) => {
  const employee = await prisma.employee.findUnique({ where: { id: Number(req.user.id) } });
  if (!employee) throw new AppError('Employee not found', 404);
  const settings = await prisma.attendanceSettings.findUnique({ where: { organizationId: employee.organizationId } });
  res.json(settings);
});

const getDailySalary = catchAsync(async (req, res) => {
  const { month, year } = req.query;
  const employeeId = Number(req.user.id);
  const creditWhere = { employeeId, isTest: false };
  const attendanceWhere = { employeeId, isTest: false };

  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
    creditWhere.date = { gte: start, lte: end };
    attendanceWhere.date = { gte: start, lte: end };
  }

  const [credits, attendances, approvedLeaves] = await Promise.all([
    prisma.dailySalaryCredit.findMany({
      where: creditWhere,
      orderBy: { date: 'asc' },
    }),
    prisma.attendance.findMany({
      where: attendanceWhere,
      orderBy: { date: 'asc' },
    }),
    prisma.leaveRequest.findMany({
      where: { employeeId, status: 'approved', ...(attendanceWhere.date ? { date: attendanceWhere.date } : {}) },
      orderBy: { date: 'asc' },
    }),
  ]);

  const creditByDate = new Map(
    credits.map((c) => [new Date(c.date).toISOString().split('T')[0], c])
  );

  const entries = attendances.map((att) => {
    const dateKey = new Date(att.date).toISOString().split('T')[0];
    const credit = creditByDate.get(dateKey);
    const isApprovedLeave = approvedLeaves.some((leave) => new Date(leave.date).toISOString().split('T')[0] === dateKey);
    const hoursWorked = att.totalHours ?? 0;
    return {
      id: att.id,
      date: att.date,
      checkInTime: att.checkInTime,
      checkOutTime: att.checkOutTime,
      checkInTimestamp: att.checkInTimestamp,
      checkOutTimestamp: att.checkOutTimestamp,
      hoursWorked,
      amountCredited: credit?.amountCredited ?? null,
      credited: !!credit,
      markedByHr: att.markedByHr ?? false,
      status: isApprovedLeave ? 'leave' : att.status,
    };
  });
  const attendanceDates = new Set(attendances.map((att) => new Date(att.date).toISOString().split('T')[0]));
  entries.push(...approvedLeaves
    .filter((leave) => !attendanceDates.has(new Date(leave.date).toISOString().split('T')[0]))
    .map((leave) => ({
      id: `leave_${leave.id}`,
      date: leave.date,
      checkInTime: null,
      checkOutTime: null,
      checkInTimestamp: null,
      checkOutTimestamp: null,
      hoursWorked: 0,
      amountCredited: null,
      credited: false,
      markedByHr: false,
      status: 'leave',
    })));
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  const monthlyTotal = credits.reduce((sum, c) => sum + c.amountCredited, 0);

  res.json({
    credits,
    entries,
    monthlyTotal: Math.round(monthlyTotal * 100) / 100,
    month: month ? Number(month) : null,
    year: year ? Number(year) : null,
  });
});

const getNotifications = catchAsync(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { employeeId: Number(req.user.id) },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Keep only the latest salary notification per calendar day
  const salaryByDate = new Map();
  const other = [];

  notifications.forEach((n) => {
    if (!SALARY_NOTIFICATION_TITLES.includes(n.title)) {
      other.push(n);
      return;
    }
    const match = n.message.match(/Attendance marked for (\d{1,2} \w{3} \d{4})/);
    const dateKey = match ? match[1] : String(n.id);
    const existing = salaryByDate.get(dateKey);
    if (!existing || new Date(n.createdAt) > new Date(existing.createdAt)) {
      salaryByDate.set(dateKey, n);
    }
  });

  const deduped = [...other, ...salaryByDate.values()]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50);

  res.json(deduped);
});

const markNotificationRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const notification = await prisma.notification.findFirst({
    where: { id: Number(id), employeeId: Number(req.user.id) },
  });
  if (!notification) throw new AppError('Notification not found', 404);

  const updated = await prisma.notification.update({
    where: { id: Number(id) },
    data: { isRead: true },
  });
  res.json(updated);
});

const markAllNotificationsRead = catchAsync(async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { employeeId: Number(req.user.id), isRead: false },
    data: { isRead: true },
  });
  res.json({ updated: result.count });
});

const submitQuery = catchAsync(async (req, res) => {
  const { subject, message } = req.body;
  const trimmedSubject = String(subject ?? '').trim();
  const trimmedMessage = String(message ?? '').trim();

  if (!trimmedSubject) throw new AppError('Subject is required', 400);
  if (!trimmedMessage) throw new AppError('Message is required', 400);

  const query = await prisma.employeeQuery.create({
    data: {
      employeeId: Number(req.user.id),
      subject: trimmedSubject,
      message: trimmedMessage,
      status: 'open',
    },
  });

  const employee = await prisma.employee.findUnique({ where: { id: Number(req.user.id) } });
  if (employee) {
    await createHrNotification({
      organizationId: employee.organizationId,
      title: 'New employee query',
      message: `${employee.name} submitted a query: "${trimmedSubject}".`,
      type: 'info',
      category: 'query',
      linkPath: '/hradmin/employee-queries',
    });
  }

  res.status(201).json(query);
});

const getMyQueries = catchAsync(async (req, res) => {
  const queries = await prisma.employeeQuery.findMany({
    where: { employeeId: Number(req.user.id) },
    orderBy: { createdAt: 'desc' },
  });
  res.json(queries);
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new AppError('Current and new password are required', 400);
  }

  const employee = await prisma.employee.findUnique({ where: { id: Number(req.user.id) } });
  if (!employee) throw new AppError('Employee not found', 404);

  const isMatch = await bcrypt.compare(currentPassword, employee.password);
  if (!isMatch) throw new AppError('Current password incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, 10);
  const updated = await prisma.employee.update({ where: { id: Number(req.user.id) }, data: { password: hashed } });

  res.json({ message: 'Password updated successfully', employee: { id: updated.id, email: updated.email } });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  checkIn,
  markAbsent,
  checkOut,
  getAttendanceHistory,
  getMonthlySummary,
  submitLeaveRequest,
  submitLeaveRequestsBatch,
  getMyLeaveRequests,
  submitLateRequest,
  getMyLateRequests,
  getDashboard,
  getHolidays,
  getSettings,
  uploadProfilePicture,
  getDailySalary,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  submitQuery,
  getMyQueries,
  exportAttendance,
};
