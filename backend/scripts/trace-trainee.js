const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'younovate_lms' });
    console.log('Connected to:', mongoose.connection.name);
    const db = mongoose.connection.db;
    
    const trainee = await db.collection('users').findOne({ email: 'trainee@younovate.in' });
    console.log('Trainee _id:', trainee._id);
    console.log('Trainee batchIds:', trainee.batchIds);
    console.log('Trainee isActive:', trainee.isActive);
    console.log('Trainee role:', trainee.role);
    
    // Check which sessions this trainee can see
    const sessions = await db.collection('sessions').find({
      $or: [
        { batchId: { $in: trainee.batchIds } },
        { trainees: trainee._id },
      ]
    }).limit(10).toArray();
    
    console.log('\nSessions trainee can see:');
    sessions.forEach(s => {
      console.log(`  ${s.title} | batchId: ${s.batchId} | trainees: ${s.trainees?.join(',')}`);
    });
    
    // Check sessions in testing demo batch
    const testingBatch = await db.collection('sessions').find({ batchId: '6a7ae2281607257e8f810bb4' }).limit(5).toArray();
    console.log('\nSessions in testing demo batch:');
    testingBatch.forEach(s => {
      console.log(`  ${s.title} | trainees: ${s.trainees?.join(',')}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
