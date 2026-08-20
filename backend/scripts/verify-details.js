const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/younovate_lms', { dbName: 'younovate_lms' });
    console.log('Connected');
    const db = mongoose.connection.db;
    
    console.log('\n--- Assignments ---');
    const assignments = await db.collection('assignments').find({}).limit(5).toArray();
    console.log('Count:', assignments.length);
    assignments.forEach((a, i) => {
      console.log(`  ${i}: ${a.title} | batchId: ${a.batchId} | createdBy: ${a.createdBy}`);
    });
    
    console.log('\n--- Course Subscriptions ---');
    const subs = await db.collection('coursesubscriptions').find({}).limit(5).toArray();
    console.log('Count:', subs.length);
    subs.forEach((s, i) => {
      console.log(`  ${i}: trainee: ${s.trainee} | course: ${s.course} | status: ${s.status}`);
    });
    
    console.log('\n--- Workshop Attendances ---');
    const was = await db.collection('workshopattendances').find({}).limit(5).toArray();
    console.log('Count:', was.length);
    was.forEach((w, i) => {
      console.log(`  ${i}: sessionId: ${w.sessionId} | studentId: ${w.studentId} | status: ${w.attendanceStatus}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
