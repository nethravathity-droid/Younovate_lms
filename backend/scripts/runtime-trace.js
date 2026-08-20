/**
 * RUNTIME TRACE - finzl batch session visibility debug
 * Run: node scripts/runtime-trace.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function trace() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/younovate_lms');
  const db = mongoose.connection.db;

  // STEP 1: Find finzl batch
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 1: FIND finzl BATCH');
  console.log('═══════════════════════════════════════════');
  const finzlBatch = await db.collection('workshopBatches').findOne({ batchName: 'finzl' });
  
  if (!finzlBatch) {
    console.log('❌ No batch named "finzl" found!');
    const allBatches = await db.collection('workshopBatches').find().toArray();
    console.log('All batches:');
    allBatches.forEach(b => console.log(`  ${b._id} | ${b.batchName} | students:${(b.students||[]).length}`));
    process.exit(1);
  }
  
  console.log(`✅ Batch found:`);
  console.log(`  _id:           ${finzlBatch._id}`);
  console.log(`  batchName:     ${finzlBatch.batchName}`);
  console.log(`  workshopId:    ${finzlBatch.workshopId}`);
  console.log(`  students[]:    ${(finzlBatch.students || []).map(s => s.toString()).join(', ')}`);
  console.log(`  registrationIds[]: ${(finzlBatch.registrationIds || []).map(r => r.toString()).join(', ')}`);
  console.log(`  trainerId:     ${finzlBatch.trainerId}`);
  console.log(`  status:        ${finzlBatch.status}`);

  // STEP 2: Check what user is linked
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 2: FIND TRAINEE USER');
  console.log('═══════════════════════════════════════════');
  const userEmail = 'preethikanaik2@gmail.com';
  const trainee = await db.collection('users').findOne({ email: userEmail });
  
  if (!trainee) {
    console.log(`❌ No user found with email: ${userEmail}`);
    // Try to find by just searching all users
    const allUsers = await db.collection('users').find().toArray();
    console.log('All users in DB:');
    allUsers.forEach(u => console.log(`  ${u._id} | ${u.name} | ${u.email} | ${u.role}`));
    process.exit(1);
  }
  console.log(`✅ Trainee found:`);
  console.log(`  _id:       ${trainee._id}`);
  console.log(`  name:      ${trainee.name}`);
  console.log(`  email:     ${trainee.email}`);
  console.log(`  role:      ${trainee.role}`);
  console.log(`  isActive:  ${trainee.isActive}`);
  console.log(`  batchIds:  ${(trainee.batchIds || []).map(b => b.toString()).join(', ') || 'EMPTY'}`);

  // Check if trainee is in finzl batch students[]
  const isInStudents = (finzlBatch.students || []).some(s => s.toString() === trainee._id.toString());
  console.log(`\n  In finzl batch students[]? ${isInStudents ? '✅ YES' : '❌ NO'}`);

  // STEP 3: Find registration
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 3: FIND REGISTRATION');
  console.log('═══════════════════════════════════════════');
  const regs = await db.collection('workshopRegistrations').find({ email: userEmail }).toArray();
  console.log(`Found ${regs.length} registrations:`);
  regs.forEach(r => console.log(`  ${r._id} | ${r.fullName} | status:${r.registrationStatus} | userId:${r.userId || 'NULL'} | workshopId:${r.workshopId}`));

  // Check if any registration userId matches trainee
  const matchingReg = regs.find(r => r.userId && r.userId.toString() === trainee._id.toString());
  console.log(`\n  Registration linking to trainee: ${matchingReg ? '✅ YES' : '❌ NO'}`);

  // STEP 4: Find all WORKSHOP sessions
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 4: ALL WORKSHOP SESSIONS');
  console.log('═══════════════════════════════════════════');
  const allWsSessions = await db.collection('sessions').find({ sessionType: 'WORKSHOP' }).toArray();
  console.log(`Total WORKSHOP sessions: ${allWsSessions.length}`);

  if (allWsSessions.length === 0) {
    console.log('❌ No WORKSHOP sessions exist at all!');
    // Check all sessions
    const allSessions = await db.collection('sessions').find().toArray();
    console.log(`\nAll sessions in DB: ${allSessions.length}`);
    allSessions.forEach(s => console.log(`  ${s._id} | ${s.title} | type:${s.sessionType} | status:${s.status}`));
  } else {
    allWsSessions.forEach(s => {
      const batchId = s.workshopBatchId ? s.workshopBatchId.toString() : 'NONE';
      const matchesFinzl = batchId === finzlBatch._id.toString();
      console.log(`  ${s._id} | "${s.title}" | workshopBatchId: ${batchId} | matches finzl: ${matchesFinzl ? '✅ YES' : '❌ NO'} | status: ${s.status} | scheduledAt: ${s.scheduledAt}`);
    });

    // Check if any session actually matches finzl batch
    const finzlSessions = allWsSessions.filter(s => s.workshopBatchId && s.workshopBatchId.toString() === finzlBatch._id.toString());
    console.log(`\n  Sessions for finzl batch: ${finzlSessions.length}`);
    
    if (finzlSessions.length === 0) {
      // Check what batchIds the sessions are linked to
      console.log('\n  Checking batch IDs on existing sessions vs finzl batch ID:');
      console.log(`  finzl batch _id: ${finzlBatch._id}`);
      allWsSessions.forEach(s => {
        console.log(`  Session "${s.title}" has workshopBatchId: ${s.workshopBatchId ? s.workshopBatchId.toString() : 'NOT SET'}`);
        if (!s.workshopBatchId) {
          console.log(`    ❌ workshopBatchId is missing on this session!`);
        }
      });
    }
  }

  // STEP 5: Simulate the trainee API query
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 5: SIMULATE TRAINEE API');
  console.log('═══════════════════════════════════════════');

  // Query 1: Find batches where trainee is in students[]
  const traineeBatches = await db.collection('workshopBatches').find({
    students: trainee._id
  }).toArray();
  console.log(`WorkshopBatch.find({ students: ${trainee._id} }) → ${traineeBatches.length} batches`);
  traineeBatches.forEach(b => console.log(`  ${b._id} | ${b.batchName}`));

  console.log(`\n  (Without ObjectId wrapping)`);
  const traineeBatches2 = await db.collection('workshopBatches').find({
    students: { $elemMatch: { $eq: trainee._id } }
  }).toArray();
  console.log(`WorkshopBatch.find with $elemMatch → ${traineeBatches2.length} batches`);

  // Query 2: Find sessions for those batches
  const batchIds = traineeBatches.map(b => b._id);
  console.log(`\n  Batch IDs for session query: ${batchIds.map(b => b.toString()).join(', ')}`);
  
  const traineeSessions = await db.collection('sessions').find({
    sessionType: 'WORKSHOP',
    workshopBatchId: { $in: batchIds }
  }).toArray();
  console.log(`Session.find({ sessionType: 'WORKSHOP', workshopBatchId: { $in: [batchIds] } }) → ${traineeSessions.length} sessions`);

  if (traineeSessions.length > 0) {
    traineeSessions.forEach(s => console.log(`  ${s._id} | ${s.title} | ${s.status}`));
  } else {
    console.log('❌ No sessions returned for trainee!');
    
    // Try without sessionType filter
    const anySessions = await db.collection('sessions').find({
      workshopBatchId: { $in: batchIds }
    }).toArray();
    console.log(`\n  Session.find without sessionType filter → ${anySessions.length} sessions`);
    anySessions.forEach(s => console.log(`  ${s._id} | ${s.title} | type: ${s.sessionType} | status: ${s.status}`));
  }

  // STEP 6: Check if the existing sessions have wrong batchId
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 6: SESSION BATCH ID COMPARISON');
  console.log('═══════════════════════════════════════════');
  const allSessions = await db.collection('sessions').find({ sessionType: 'WORKSHOP' }).toArray();
  const allBatches = await db.collection('workshopBatches').find().toArray();
  
  console.log('All workshopBatchIds on sessions vs all batch IDs:');
  allSessions.forEach(s => {
    const sessionBatchId = s.workshopBatchId ? s.workshopBatchId.toString() : 'NONE';
    const matchingBatch = allBatches.find(b => b._id.toString() === sessionBatchId);
    console.log(`  Session "${s.title}": workshopBatchId=${sessionBatchId}`);
    console.log(`    Matching batch: ${matchingBatch ? matchingBatch.batchName + ' (' + matchingBatch._id + ')' : '❌ NO MATCH'}`);
  });

  // STEP 7: Check the workshop
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 7: WORKSHOP DETAILS');
  console.log('═══════════════════════════════════════════');
  const workshops = await db.collection('workshops').find().toArray();
  workshops.forEach(w => console.log(`  ${w._id} | ${w.title} | status: ${w.status}`));

  const batchWorkshop = workshops.find(w => w._id.toString() === finzlBatch.workshopId.toString());
  console.log(`\n  finzl batch linked to workshop: ${batchWorkshop ? batchWorkshop.title + ' (' + batchWorkshop._id + ')' : '❌ NOT FOUND'}`);

  await mongoose.disconnect();
  console.log('\n═══════════════════════════════════════════');
  console.log('TRACE COMPLETE');
  console.log('═══════════════════════════════════════════\n');
}
trace().catch(e => { console.error('FATAL:', e); process.exit(1); });

