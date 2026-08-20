const mongoose = require('mongoose');
const uri = 'mongodb+srv://preethikanaik2_db_user:YounovateAtlas2026@cluster0.qfoml2r.mongodb.net/younovate_lms';

async function main() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name).join(', '));
    
    const sessionColl = db.collection('sessions');
    const indexes = await sessionColl.indexes();
    console.log('Session indexes:', JSON.stringify(indexes, null, 2));
    
    const userColl = db.collection('users');
    const userIndexes = await userColl.indexes();
    console.log('User indexes:', JSON.stringify(userIndexes, null, 2));
    
    const batchColl = db.collection('batches');
    const batchIndexes = await batchColl.indexes();
    console.log('Batch indexes:', JSON.stringify(batchIndexes, null, 2));
    
    const counts = {};
    for (const c of collections) {
      counts[c.name] = await db.collection(c.name).countDocuments();
    }
    console.log('Counts:', JSON.stringify(counts, null, 2));
    
    // Test session query performance
    console.log('\n--- Session query test ---');
    const start = Date.now();
    const sessions = await sessionColl.find({
      $or: [
        { sessionType: 'LMS' },
        { sessionType: { $exists: false } },
        { sessionType: null }
      ]
    }).sort({ scheduledAt: -1 }).limit(200).toArray();
    console.log(`Found ${sessions.length} sessions in ${Date.now() - start}ms`);
    
    // Test count performance
    const countStart = Date.now();
    const total = await sessionColl.countDocuments({
      $or: [
        { sessionType: 'LMS' },
        { sessionType: { $exists: false } },
        { sessionType: null }
      ]
    });
    console.log(`Counted ${total} sessions in ${Date.now() - countStart}ms`);
    
    // Test dashboard query components
    console.log('\n--- Dashboard query tests ---');
    const traineeCountStart = Date.now();
    const traineeCount = await userColl.countDocuments({ role: 'trainee', isActive: true });
    console.log(`Trainee count: ${traineeCount} in ${Date.now() - traineeCountStart}ms`);
    
    const batchCountStart = Date.now();
    const batchCount = await batchColl.countDocuments();
    console.log(`Batch count: ${batchCount} in ${Date.now() - batchCountStart}ms`);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

main();
