require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db.js');
const User = require('../models/user.model.js');

async function seedAdmin() {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

    let admin = await User.findOne({ email });
    let matchLabel = 'email';

    if (!admin && username) {
      admin = await User.findOne({ username });
      matchLabel = 'username';
    }

    if (!admin) {
      admin = await User.findOne({ role: 'admin' });
      matchLabel = 'role';
    }

    if (admin) {
      admin.email = email;
      admin.username = username;
      admin.password = password;
      admin.role = 'admin';
      admin.status = 'active';
      admin.requiresApproval = false;
      admin.fullName = admin.fullName || 'System Administrator';
      await admin.save();
      console.log(`Admin account updated (${matchLabel} match): ${admin.email}`);
    } else {
      const created = new User({
        username,
        email,
        password,
        role: 'admin',
        status: 'active',
        requiresApproval: false,
        fullName: 'System Administrator',
      });
      await created.save();
      console.log(`Admin account created: ${email}`);
    }

    console.log(`Login with email: ${email}`);
    console.log(`Login with username: ${username}`);
    console.log('Password is set from ADMIN_PASSWORD in backend/.env');
    console.log('IMPORTANT: Change the password after first login.');

    await disconnectDB();
  } catch (err) {
    console.error('Failed to seed admin:', err);
    try {
      await disconnectDB();
    } catch (e) {}
    process.exit(1);
  }
}

if (require.main === module) {
  seedAdmin();
}
