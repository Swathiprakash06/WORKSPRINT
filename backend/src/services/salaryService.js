const prisma = require('../db/prismaClient');
const {
  MIN_HOURS_FOR_SALARY,
  calculatePerDaySalary,
  getWorkingDaysInMonth,
  getMonthYearFromDate,
  formatCurrency,
} = require('../utils/salaryUtils');
const { createNotification, clearSalaryNotificationsForDate } = require('./notificationService');
const { createDateOnly } = require('../utils/dateUtils');

const formatDateLabel = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Process salary credit after attendance is recorded with known working hours.
 * Test/simulate records never notify the employee (keeps QA separate from real payroll).
 */
const processSalaryCredit = async ({
  employeeId,
  attendanceDate,
  totalHours,
  isTest = false,
  hrMarked = false,
}) => {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    return { credited: false, reason: 'Employee not found' };
  }

  const dateOnly = createDateOnly(new Date(attendanceDate));
  const dateLabel = formatDateLabel(dateOnly);

  const existingCredit = await prisma.dailySalaryCredit.findUnique({
    where: {
      employeeId_date_isTest: { employeeId, date: dateOnly, isTest },
    },
  });

  if (existingCredit) {
    return { credited: false, reason: 'Already credited for this date', existingCredit };
  }

  if (totalHours < MIN_HOURS_FOR_SALARY) {
    let notification = null;
    if (!isTest) {
      await clearSalaryNotificationsForDate(employeeId, dateLabel);
      const prefix = hrMarked ? 'HR verified your attendance for' : 'Attendance marked for';
      const message = `${prefix} ${dateLabel}, but salary not credited — hours below ${MIN_HOURS_FOR_SALARY} (${totalHours}h worked).`;
      notification = await createNotification({
        employeeId,
        title: 'Attendance marked — no salary credit',
        message,
        type: 'warning',
        category: 'salary',
        linkPath: '/employee/daily-salary',
      });
    }
    return { credited: false, reason: 'Insufficient hours', notification, totalHours };
  }

  if (!employee.monthlySalary || employee.monthlySalary <= 0) {
    let notification = null;
    if (!isTest) {
      await clearSalaryNotificationsForDate(employeeId, dateLabel);
      const message = `Attendance marked for ${dateLabel}, but salary not credited — no monthly salary assigned.`;
      notification = await createNotification({
        employeeId,
        title: 'Attendance marked — no salary credit',
        message,
        type: 'warning',
        category: 'salary',
        linkPath: '/employee/daily-salary',
      });
    }
    return { credited: false, reason: 'No monthly salary assigned', notification };
  }

  const { year, month } = getMonthYearFromDate(dateOnly);
  const workingDaysUsed = getWorkingDaysInMonth(year, month);
  const perDayRateUsed = calculatePerDaySalary(employee.monthlySalary, year, month);

  const credit = await prisma.dailySalaryCredit.create({
    data: {
      employeeId,
      date: dateOnly,
      hoursWorked: totalHours,
      amountCredited: perDayRateUsed,
      monthlySalaryUsed: employee.monthlySalary,
      workingDaysUsed,
      perDayRateUsed,
      isTest,
    },
  });

  let notification = null;
  if (!isTest) {
    await clearSalaryNotificationsForDate(employeeId, dateLabel);
    const prefix = hrMarked ? 'HR verified your attendance for' : 'Attendance marked for';
    const message = `${prefix} ${dateLabel}. ${formatCurrency(perDayRateUsed)} salary credited for today.`;
    notification = await createNotification({
      employeeId,
      title: 'Salary credited',
      message,
      type: 'success',
      category: 'salary',
      linkPath: '/employee/daily-salary',
    });
  }

  return {
    credited: true,
    amount: perDayRateUsed,
    credit,
    notification,
    totalHours,
  };
};

module.exports = {
  processSalaryCredit,
  MIN_HOURS_FOR_SALARY,
  formatDateLabel,
};
