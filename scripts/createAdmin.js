/**
 * Run this script once to create the initial admin account:
 * node scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  try {
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@college.com',
      password: hashedPassword
    });
    console.log('✅ Admin created!  Email:', admin.email, '  Password: Admin@123');
    console.log('⚠️  Change your password after first login!');
  } catch (err) {
    if (err.code === 11000) console.log('ℹ️  Admin already exists.');
    else console.error('❌', err.message);
  }
  await mongoose.disconnect();
}

createAdmin();
