const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'younovate_lms' });
    console.log('Connected to:', mongoose.connection.name);
    const db = mongoose.connection.db;
    
    console.log('Dropping all non-_id indexes on workshopattendances...');
    const indexes = await db.collection('workshopattendances').indexes();
    for (const idx of indexes) {
      if (idx.name !== '_id_') {
        try {
          await db.collection('workshopattendances').dropIndex(idx.name);
          console.log('  Dropped:', idx.name);
        } catch (e) {
          console.log('  Failed to drop', idx.name, ':', e.message);
        }
      }
    }
    
    console.log('\nRemaining indexes:');
    const remaining = await db.collection('workshopattendances').indexes();
    remaining.forEach(idx => console.log(' ', idx.name, '-', JSON.stringify(idx.key)));
    
    await mongoose.disconnect();
    console.log('\nDone');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
