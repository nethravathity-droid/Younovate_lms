const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/younovate_lms', { dbName: 'younovate_lms' });
    console.log('Connected');
    const db = mongoose.connection.db;
    
    const collections = await db.listCollections().toArray();
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(c.name + ': ' + count);
    }
    
    console.log('\n--- Users by role ---');
    const roles = ['admin', 'trainer', 'trainee', 'hr'];
    for (const r of roles) {
      const count = await db.collection('users').countDocuments({ role: r });
      console.log(r + ': ' + count);
    }
    
    console.log('\n--- Trainee check ---');
    const trainee = await db.collection('users').findOne({ email: 'trainee@younovate.in' });
    console.log('trainee@younovate.in:', trainee ? 'FOUND' : 'NOT FOUND');
    if (trainee) {
      console.log('  batchIds:', trainee.batchIds);
      console.log('  isActive:', trainee.isActive);
    }
    
    const traineeMail = await db.collection('users').findOne({ email: 'trainee@younovate@mail.com' });
    console.log('trainee@younovate@mail.com:', traineeMail ? 'FOUND' : 'NOT FOUND');
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
