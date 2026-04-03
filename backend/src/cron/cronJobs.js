const cron = require('node-cron');
const prisma = require('../db/prismaClient');

const markAbsentAfterHours = async () => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  // Fetch all employees and set attendance absent if no record for today
  const employees = await prisma.employee.findMany({ where: { status: 'active' } });

  await Promise.all(employees.map(async (employee) => {
    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: startOfDay } },
    });
    if (!existing) {
      await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: startOfDay,
          status: 'absent',
        },
      });
    }
  }));
};

const initCronJobs = () => {
  // run every day at 19:00
  cron.schedule('0 19 * * *', async () => {
    try {
      await markAbsentAfterHours();
      console.log('Cron: auto-mark absent task completed');
    } catch (error) {
      console.error('Cron error:', error);
    }
  });
};

module.exports = { initCronJobs, markAbsentAfterHours };
