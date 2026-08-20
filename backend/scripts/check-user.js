const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/younovate_lms', { dbName: 'younovate_lms' });
    console.log('Connected');
    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    const traineeIn = await users.findOne({ email: 'trainee@younovate.in' });
    console.log('trainee@younovate.in:', traineeIn ? 'FOUND' : 'NOT FOUND');
    if (traineeIn) {
      console.log('  role:', traineeIn.role);
      console.log('  isActive:', traineeIn.isActive);
      console.log('  accountStatus:', traineeIn.accountStatus);
      console.log('  batchIds:', traineeIn.batchIds);
      console.log('  placementStatus:', traineeIn.placementStatus);
    }
    
    const admin = await users.findOne({ role: 'admin' });
    console.log('\nAdmin:', admin ? { email: admin.email, name: admin.name, isActive: admin.isActive } : 'NONE');
    
    const trainers = await users.find({ role: 'trainer' }).toArray();
    console.log('\nTrainers:', trainers.length);
    trainers.forEach(t => console.log(' ', t.email, '-', t.name, '- active:', t.isActive));
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
