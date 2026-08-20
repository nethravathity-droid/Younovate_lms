const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'younovate_lms' });
    console.log('Connected to:', mongoose.connection.name);
    const db = mongoose.connection.db;
    
    const docs = await db.collection('workshopattendances').find({}).limit(20).toArray();
    console.log('Total workshop attendances:', docs.length);
    docs.forEach((d, i) => {
      console.log(`\nDoc ${i}:`);
      console.log('  _id:', d._id);
      console.log('  sessionId:', d.sessionId);
      console.log('  studentId:', d.studentId);
      console.log('  participantId:', d.participantId);
      console.log('  workshopBatchId:', d.workshopBatchId);
      console.log('  workshopId:', d.workshopId);
      console.log('  attendanceStatus:', d.attendanceStatus);
    });
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
