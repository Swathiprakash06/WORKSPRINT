const bcrypt = require('bcrypt');
const prisma = require('../db/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { isWithinRadius } = require('../services/locationService');
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
  const payload = req.body;
  const updated = await prisma.employee.update({ where: { id: Number(req.user.id) }, data: payload });
  res.json(updated);
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
  const { latitude, longitude, lateReason } = req.body;
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

  const today = new Date();
  const dateOnly = createDateOnly(today);
  const currentTime = getCurrentTimeString();

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

  const attendance = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: employee.id, date: dateOnly } },
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

const checkOut = catchAsync(async (req, res) => {
  const { latitude, longitude, earlyCheckoutReason } = req.body;
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

  const today = new Date();
  const dateOnly = createDateOnly(today);
  const currentTime = getCurrentTimeString();

  const existing = await prisma.attendance.findUnique({ where: { employeeId_date: { employeeId: employee.id, date: dateOnly } } });
  if (!existing) throw new AppError('Check in first', 400);

  const officeEnd = settings?.officeEnd || '18:00';
  const isEarlyCheckout = minutesFromHHMM(currentTime) < minutesFromHHMM(officeEnd);
  if (isEarlyCheckout) {
    const trimmed = earlyCheckoutReason != null ? String(earlyCheckoutReason).trim() : '';
    if (!trimmed) {
      throw new AppError('Early check-out requires a reason (before official office end time)', 400);
    }
  }

  const checkInDate = existing.checkInTimestamp || today;
  const diffMs = today - checkInDate;
  const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

  const attendance = await prisma.attendance.update({
    where: { id: existing.id },
    data: {
      checkOutTime: currentTime,
      checkOutTimestamp: today,
      totalHours,
      earlyCheckoutReason: isEarlyCheckout ? String(earlyCheckoutReason).trim() : null,
    },
  });

  res.json(attendance);
});

const getAttendanceHistory = catchAsync(async (req, res) => {
  const records = await prisma.attendance.findMany({ where: { employeeId: Number(req.user.id) }, orderBy: { date: 'desc' } });
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
};
