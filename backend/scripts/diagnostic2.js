const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/younovate_lms');
    console.log('Connected to local MongoDB');
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
    
    // Explain session query
    console.log('\n--- Session query explain ---');
    const explain = await sessionColl.find({
      $or: [
        { sessionType: 'LMS' },
        { sessionType: { $exists: false } },
        { sessionType: null }
      ]
    }).sort({ scheduledAt: -1 }).limit(200).explain('executionStats');
    console.log('Execution time:', explain.executionStats.executionTimeMillis, 'ms');
    console.log('Total docs examined:', explain.executionStats.totalDocsExamined);
    console.log('Total keys examined:', explain.executionStats.totalKeysExamined);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

main();
