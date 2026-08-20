/**
 * Test Session Creation for finzl batch
 * Run: node scripts/test-session-create.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/younovate_lms');
  const db = mongoose.connection.db;
  
  const finzlBatch = await db.collection('workshopBatches').findOne({ batchName: 'finzl' });
  console.log('finzl batch ID:', finzlBatch._id.toString());
  console.log('trainerId:', finzlBatch.trainerId ? finzlBatch.trainerId.toString() : 'NULL');
  
  if (finzlBatch.trainerId) {
    const trainer = await db.collection('users').findOne({ _id: finzlBatch.trainerId });
    console.log('Trainer:', trainer ? trainer.name + ' (' + trainer.email + ')' : 'NOT FOUND');
  }
  
  // Try creating a session using Mongoose
  const Session = require('../src/models/Session');
  
  // Check if session already exists for this batch
  const existing = await Session.find({ sessionType: 'WORKSHOP', workshopBatchId: finzlBatch._id });
  console.log('Existing sessions for finzl:', existing.length);
  
  if (existing.length === 0) {
    console.log('\nCreating test session...');
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const session = await Session.create({
      sessionType: 'WORKSHOP',
      workshopBatchId: finzlBatch._id,
      title: 'Test Session - finzl Batch',
      description: 'Testing session creation for finzl batch',
      scheduledAt: scheduledTime,
      durationMinutes: 60,
      trainerId: finzlBatch.trainerId,
      status: 'scheduled',
      joinBeforeMinutes: 15,
    });
    
    console.log('Session created:', session._id.toString());
    console.log('Session title:', session.title);
    
    // Verify in raw DB
    const saved = await db.collection('sessions').findOne({ _id: session._id });
    console.log('\nRaw DB check:');
    console.log('  Found in DB:', saved ? 'YES' : 'NO');
    console.log('  workshopBatchId:', saved.workshopBatchId.toString());
    console.log('  matches finzl batch:', saved.workshopBatchId.toString() === finzlBatch._id.toString());
    
    // Clean up
    await Session.findByIdAndDelete(session._id);
    console.log('\nTest session cleaned up');
  }
  
  await mongoose.disconnect();
}

run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

