const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/younovate_lms', { dbName: 'younovate_lms' });
    console.log('Connected');
    const db = mongoose.connection.db;
    
    console.log('Dropping old participantId indexes from workshopattendances...');
    try {
      await db.collection('workshopattendances').dropIndex('sessionId_1_participantId_1');
      console.log('  Dropped sessionId_1_participantId_1');
    } catch (e) {
      console.log('  sessionId_1_participantId_1:', e.message);
    }
    try {
      await db.collection('workshopattendances').dropIndex('workshopBatchId_1_participantId_1');
      console.log('  Dropped workshopBatchId_1_participantId_1');
    } catch (e) {
      console.log('  workshopBatchId_1_participantId_1:', e.message);
    }
    try {
      await db.collection('workshopattendances').dropIndex('workshopId_1_participantId_1');
      console.log('  Dropped workshopId_1_participantId_1');
    } catch (e) {
      console.log('  workshopId_1_participantId_1:', e.message);
    }
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
