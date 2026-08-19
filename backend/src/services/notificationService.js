const prisma = require('../db/prismaClient');

const SALARY_NOTIFICATION_TITLES = [
  'Salary credited',
  'Attendance marked — no salary credit',
];

const createNotification = async ({
  employeeId,
  title,
  message,
  type = 'info',
  category = null,
  linkPath = null,
}) => {
  return prisma.notification.create({
    data: {
      employeeId,
      title,
      message,
      type,
      category,
      linkPath,
    },
  });
};

const createHrNotification = async ({
  organizationId,
  title,
  message,
  type = 'info',
  category = null,
  linkPath = null,
}) => {
  return prisma.hrAdminNotification.create({
    data: {
      organizationId,
      title,
      message,
      type,
      category,
      linkPath,
    },
  });
};

const notifyOrganizationEmployees = async ({
  organizationId,
  title,
  message,
  type = 'info',
  category = null,
  linkPath = null,
}) => {
  const employees = await prisma.employee.findMany({
    where: { organizationId, status: 'active' },
    select: { id: true },
  });

  if (employees.length === 0) return [];

  return prisma.notification.createMany({
    data: employees.map((emp) => ({
      employeeId: emp.id,
      title,
      message,
      type,
      category,
      linkPath,
    })),
  });
};

/** Remove prior salary notifications for the same employee and calendar day. */
const clearSalaryNotificationsForDate = async (employeeId, dateLabel) => {
  const existing = await prisma.notification.findMany({
    where: {
      employeeId,
      title: { in: SALARY_NOTIFICATION_TITLES },
      message: { contains: dateLabel },
    },
  });

  if (existing.length === 0) return;

  await prisma.notification.deleteMany({
    where: { id: { in: existing.map((n) => n.id) } },
  });
};

module.exports = {
  createNotification,
  createHrNotification,
  notifyOrganizationEmployees,
  clearSalaryNotificationsForDate,
  SALARY_NOTIFICATION_TITLES,
};
