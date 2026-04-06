require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../db/prismaClient');

const seedSuperAdmin = async () => {
  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@worksprint.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'super123';
  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.superAdmin.findUnique({ where: { email } });
  if (existing) {
    console.log('SuperAdmin exists:', existing.email);
    return;
  }

  const admin = await prisma.superAdmin.create({
    data: { name: 'Super Admin', email, password: hashed },
  });
  console.log('Super Admin created:', admin.email, 'password:', password);
};

if (require.main === module) {
  seedSuperAdmin().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = seedSuperAdmin;
