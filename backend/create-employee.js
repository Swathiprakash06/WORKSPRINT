require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('./src/db/prismaClient');

const createEmployee = async () => {
  try {
    // Get an organization (use the one we created for HR admin)
    let organization = await prisma.organization.findFirst();

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

    // Get an HR admin (use the one we created)
    let hrAdmin = await prisma.hrAdmin.findFirst();

    // Hash the password
    const password = 'Employee@123';
    const hashed = await bcrypt.hash(password, 10);

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        employeeId: 'EMP001',
        name: 'Employee',
        email: 'employee@company.com',
        password: hashed,
        phone: '9876543210',
        department: 'IT',
        position: 'Software Developer',
        status: 'active',
        organizationId: organization.id,
        hrAdminId: hrAdmin?.id || null
      }
    });

    console.log('\n✅ EMPLOYEE CREATED SUCCESSFULLY!');
    console.log('   Email:', employee.email);
    console.log('   Password:', password);
    console.log('   Employee ID:', employee.employeeId);
    console.log('   Status:', employee.status);
    console.log('\n🔐 You can now login with these credentials!');

    process.exit(0);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Employee with this email already exists');
    } else {
      console.error('ERROR:', error.message);
    }
    process.exit(1);
  }
};

createEmployee();
