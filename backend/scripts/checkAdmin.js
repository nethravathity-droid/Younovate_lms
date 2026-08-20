const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'younovate_lms' });
  const User = require('../src/models/User');
  
  const admin = await User.findOne({ email: 'admin@younovate.in' }).select('+password');
  console.log('Admin found:', !!admin);
  if (admin) {
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('isActive:', admin.isActive);
    console.log('Password hash length:', admin.password ? admin.password.length : 'MISSING');
    console.log('Password hash prefix:', admin.password ? admin.password.substring(0, 30) : 'MISSING');
    
    const bcrypt = require('bcryptjs');
    const match = await bcrypt.compare('Admin@1234', admin.password);
    console.log('Password match for Admin@1234:', match);
  }
  
  await mongoose.disconnect();
}

check().catch(e => { console.error(e); process.exit(1); });
