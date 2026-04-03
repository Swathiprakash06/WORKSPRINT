require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('./src/db/prismaClient');

const createHrAdmin = async () => {
  try {
    // First, get or create an organization
    let organization = await prisma.organization.findFirst({
      where: { email: 'company@example.com' }
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          companyName: 'Test Company',
          hrName: 'HR Admin',
          email: 'company@example.com',
          phone: '1234567890',
        }
      });
      console.log('✅ Organization created:', organization.companyName);
    }

    // Hash the password
    const password = 'HrAdmin@123';
    const hashed = await bcrypt.hash(password, 10);

    // Create HR admin
    const hrAdmin = await prisma.hrAdmin.create({
      data: {
        name: 'HR Admin',
        email: 'hradmin@company.com',
        password: hashed,
        organizationId: organization.id,
        status: 'active'
      }
    });

    console.log('\n✅ HR ADMIN CREATED SUCCESSFULLY!');
    console.log('   Email:', hrAdmin.email);
    console.log('   Password:', password);
    console.log('   Status:', hrAdmin.status);
    console.log('\n🔐 You can now login with these credentials!');

    process.exit(0);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ HR admin with this email already exists');
    } else {
      console.error('ERROR:', error.message);
    }
    process.exit(1);
  }
};

createHrAdmin();
