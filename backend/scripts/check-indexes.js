const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/younovate_lms', { dbName: 'younovate_lms' });
    console.log('Connected');
    const db = mongoose.connection.db;
    
    console.log('\n--- User indexes ---');
    const userIndexes = await db.collection('users').indexes();
    userIndexes.forEach(idx => console.log(' ', idx.name, '-', JSON.stringify(idx.key)));
    
    console.log('\n--- Session indexes ---');
    const sessionIndexes = await db.collection('sessions').indexes();
    sessionIndexes.forEach(idx => console.log(' ', idx.name, '-', JSON.stringify(idx.key)));
    
    console.log('\n--- Batch indexes ---');
    const batchIndexes = await db.collection('batches').indexes();
    batchIndexes.forEach(idx => console.log(' ', idx.name, '-', JSON.stringify(idx.key)));
    
    console.log('\n--- Workshop indexes ---');
    const workshopIndexes = await db.collection('workshops').indexes();
    workshopIndexes.forEach(idx => console.log(' ', idx.name, '-', JSON.stringify(idx.key)));
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
