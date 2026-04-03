require('dotenv').config();
const prisma = require('./src/db/prismaClient');
const bcrypt = require('bcrypt');

const debug = async () => {
  try {
    // Check all superadmins
    const superAdmins = await prisma.superAdmin.findMany();
    console.log('\n✅ SUPERADMINS:', superAdmins.map(s => ({ id: s.id, email: s.email, hasPassword: !!s.password })));

    // Check all hr admins
    const hrAdmins = await prisma.hrAdmin.findMany();
    console.log('\n✅ HR ADMINS:', hrAdmins.map(h => ({ id: h.id, email: h.email, status: h.status, hasPassword: !!h.password })));

    // Try to find specific HR admin
    const hrAdmin = await prisma.hrAdmin.findUnique({ 
      where: { email: 'hradmin@company.com' },
      select: { id: true, email: true, password: true, status: true }
    });

    if (hrAdmin) {
      console.log('\n✅ FOUND HR ADMIN:', { email: hrAdmin.email, status: hrAdmin.status });
      
      // Test password
      const testPassword = 'HrAdmin@123';
      const match = await bcrypt.compare(testPassword, hrAdmin.password);
      console.log(`🔐 Password test for '${testPassword}':`, match ? '✅ MATCHES' : '❌ DOES NOT MATCH');
    } else {
      console.log('\n❌ HR ADMIN NOT FOUND - Need to create one first');
    }

    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
};

debug();
