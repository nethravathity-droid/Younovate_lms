const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/younovate_lms', { dbName: 'younovate_lms' });
    console.log('Connected');
    const db = mongoose.connection.db;
    
    const docs = await db.collection('workshopattendances').find({}).limit(5).toArray();
    console.log('Workshop attendances:', docs.length);
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
    
    const indexes = await db.collection('workshopattendances').indexes();
    console.log('\nIndexes:');
    indexes.forEach(idx => console.log(' ', idx.name, '-', JSON.stringify(idx.key)));
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
