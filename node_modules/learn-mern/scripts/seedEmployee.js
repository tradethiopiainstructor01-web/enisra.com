require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db.js');
const User = require('../models/user.model.js');

async function seedEmployee() {
  try {
    await connectDB();

    const email = process.env.EMPLOYEE_EMAIL || 'employee@gmail.com';
    // Username is required by the backend model; login uses email, so this is mostly for display/search.
    const username = process.env.EMPLOYEE_USERNAME || email;
    const password = process.env.EMPLOYEE_PASSWORD || '123';

    let employee = await User.findOne({ email });
    let matchLabel = 'email';

    if (!employee && username) {
      employee = await User.findOne({ username });
      matchLabel = 'username';
    }

    if (employee) {
      employee.email = email;
      employee.username = username;
      employee.password = password;
      employee.role = 'employee';
      employee.status = 'active';
      employee.requiresApproval = false;
      employee.fullName = employee.fullName || 'Employee';
      await employee.save();
      console.log(`Employee account updated (${matchLabel} match): ${employee.email}`);
    } else {
      const created = new User({
        username,
        email,
        password,
        role: 'employee',
        status: 'active',
        requiresApproval: false,
        fullName: 'Employee',
      });
      await created.save();
      console.log(`Employee account created: ${email}`);
    }

    console.log(`Login with email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('IMPORTANT: "123" is insecure. Change this password after testing.');

    await disconnectDB();
  } catch (err) {
    console.error('Failed to seed employee:', err);
    try {
      await disconnectDB();
    } catch (e) {}
    process.exit(1);
  }
}

if (require.main === module) {
  seedEmployee();
}

