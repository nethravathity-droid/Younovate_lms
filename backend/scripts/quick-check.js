const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/younovate_lms', { dbName: 'younovate_lms' });
    console.log('Connected');
    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    const exact = await users.findOne({ email: 'trainee@younovate@mail.com' });
    console.log('Exact trainee@younovate@mail.com:', exact ? 'FOUND' : 'NOT FOUND');
    
    const traineeIn = await users.findOne({ email: 'trainee@younovate.in' });
    console.log('trainee@younovate.in:', traineeIn ? 'FOUND' : 'NOT FOUND');
    
    const demoCount = await users.countDocuments({ email: { $regex: /^trainee\d+@younovate\.in$/ } });
    console.log('Demo trainees count:', demoCount);
    
    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
