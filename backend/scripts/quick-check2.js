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
    
    console.log('\n--- Batches ---');
    const batches = await db.collection('batches').find({}).toArray();
    for (const b of batches) {
      console.log(b.name + ' | status: ' + b.status + ' | trainer: ' + (b.trainerId || 'none'));
    }
    
    console.log('\n--- Sessions ---');
    const sessions = await db.collection('sessions').find({}).limit(5).toArray();
    for (const s of sessions) {
      console.log(s.title + ' | type: ' + s.sessionType + ' | trainer: ' + s.trainerId + ' | batch: ' + s.batchId);
    }
    
    console.log('\n--- Workshops ---');
    const workshops = await db.collection('workshops').find({}).limit(5).toArray();
    for (const w of workshops) {
      console.log(w.title + ' | status: ' + w.status + ' | trainer: ' + w.trainerId);
    }
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
