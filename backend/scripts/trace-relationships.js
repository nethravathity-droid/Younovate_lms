const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/younovate_lms');
  const db = mongoose.connection.db;
  
  const users = await db.collection('users').find().toArray();
  console.log('=== ALL USERS ===');
  const userMap = {};
  users.forEach(u => { userMap[u._id.toString()] = u; console.log(u._id.toString(), '|', u.name, '|', u.email, '|', u.role); });
  
  const batches = await db.collection('workshopBatches').find().toArray();
  console.log('\n=== BATCH STUDENT MAPPING ===');
  for (const b of batches) {
    console.log('\nBatch:', b.batchName, '(' + b._id + ')');
    console.log('  students array:');
    (b.students || []).forEach(s => {
      const u = userMap[s.toString()];
      console.log('    ' + s.toString() + ' ->', u ? (u.name + ' (' + u.email + ')') : 'USER NOT FOUND!');
    });
  }
  
  const trainee = users.find(u => u.email === 'trainee@younovate.in');
  console.log('\n=== TRAINEE trainee@younovate.in ===');
  if (trainee) {
    console.log('  _id:', trainee._id.toString());
    for (const b of batches) {
      const inBatch = (b.students || []).some(s => s.toString() === trainee._id.toString());
      console.log('  Batch "' + b.batchName + '":', inBatch ? 'YES' : 'NO');
    }
  } else {
    console.log('  NOT FOUND in users!');
    const reg = await db.collection('workshopRegistrations').findOne({ email: 'trainee@younovate.in' });
    if (reg) {
      console.log('  Registration:', reg._id.toString(), 'userId:', reg.userId ? reg.userId.toString() : 'null');
      if (reg.userId) {
        const u = userMap[reg.userId.toString()];
        console.log('  User from reg:', u ? (u.name + ' (' + u.email + ')') : 'NOT FOUND!');
      }
    }
  }

  const sessions = await db.collection('sessions').find({sessionType:'WORKSHOP'}).toArray();
  console.log('\n=== SESSION-BATCH LINKAGE ===');
  for (const s of sessions) {
    const wbId = s.workshopBatchId ? s.workshopBatchId.toString() : 'null';
    const batchMatch = batches.find(b => b._id.toString() === wbId);
    console.log('Session "' + s.title + '": workshopBatchId=' + wbId, '->', batchMatch ? batchMatch.batchName : 'NO MATCH');
    if (batchMatch && trainee) {
      const inBatch = (batchMatch.students || []).some(s => s.toString() === trainee._id.toString());
      console.log('  Trainee in this batch:', inBatch ? 'YES' : 'NO');
    }
  }
  
  await mongoose.disconnect();
}
run().catch(e => { console.error('ERROR:', e); process.exit(1); });
