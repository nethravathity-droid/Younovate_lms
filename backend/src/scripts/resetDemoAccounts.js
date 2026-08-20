'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const User  = require('../models/User');
const Batch = require('../models/Batch');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'younovate_lms' });
  console.log('✅  Connected to MongoDB');

  const emails = [
    'admin@younovate.in',
    'trainer@younovate.in',
    'trainerb@younovate.in',
    'trainee@younovate.in',
    'hr@younovate.in',
  ];

  const del = await User.deleteMany({ email: { $in: emails } });
  console.log(`🗑   Deleted ${del.deletedCount} existing demo accounts`);

  const batch = await Batch.findOneAndUpdate(
    { name: 'Demo Batch 2026' },
    { name: 'Demo Batch 2026', startDate: new Date(), status: 'active', course: 'Full Stack Development' },
    { upsert: true, new: true }
  );
  console.log(`🗂   Batch ready: "${batch.name}" (${batch._id})`);

  const accounts = [
    { name: 'Admin Demo',     email: 'admin@younovate.in',    password: 'Admin@1234',    role: 'admin'   },
    { name: 'Trainer Demo',   email: 'trainer@younovate.in',  password: 'Trainer@1234',  role: 'trainer', batchIds: [batch._id] },
    { name: 'Trainer B Demo', email: 'trainerb@younovate.in', password: 'TrainerB@1234', role: 'trainer' },
    { name: 'Trainee Demo',   email: 'trainee@younovate.in',  password: 'Trainee@1234',  role: 'trainee', batchIds: [batch._id], enrolledAt: new Date() },
    { name: 'HR Demo',        email: 'hr@younovate.in',       password: 'Hr@12345678',   role: 'hr'      },
  ];

  for (const acc of accounts) {
    const u = await User.create(acc);
    console.log(`  ✅  Created ${u.role.padEnd(7)}: ${u.email}`);
  }

  console.log('\n🔑  Login credentials:');
  console.log('  admin@younovate.in      /  Admin@1234');
  console.log('  trainer@younovate.in    /  Trainer@1234');
  console.log('  trainerb@younovate.in   /  TrainerB@1234');
  console.log('  trainee@younovate.in    /  Trainee@1234');
  console.log('  hr@younovate.in         /  Hr@12345678');

  await mongoose.disconnect();
  console.log('\n🌱  Done');
  process.exit(0);
})().catch(err => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
