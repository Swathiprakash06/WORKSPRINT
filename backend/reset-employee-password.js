require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('./src/db/prismaClient');

const emailArg = process.argv[2];
const newPasswordArg = process.argv[3];

const run = async () => {
  if (!emailArg || !newPasswordArg) {
    console.log('Usage: node reset-employee-password.js <employee-email> <new-password>');
    process.exit(1);
  }

  const employee = await prisma.employee.findUnique({
    where: { email: emailArg },
  });

  if (!employee) {
    console.log('No employee found with that email.');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPasswordArg, 10);

  await prisma.employee.update({
    where: { email: emailArg },
    data: { password: hashed },
  });

  console.log('Password reset for:', employee.email);
  console.log('New password (give this to the employee):', newPasswordArg);

  process.exit(0);
};

run();