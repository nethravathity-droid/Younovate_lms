/**
 * Fix MongoDB indexes for WorkshopAttendance collection
 * 
 * The current issue: workshopId_1_studentId_1 index allows null workshopId,
 * causing duplicate key errors when workshopId is null.
 * 
 * Fix: Drop the problematic index and ensure sessionId_studentId_1 unique index is correct.
 */
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('workshopattendances');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes on workshopattendances:');
    indexes.forEach(idx => {
      console.log(`  ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Drop the problematic workshopId_1_studentId_1 index if it exists
    const problemIndex = indexes.find(idx => idx.name === 'workshopId_1_studentId_1');
    if (problemIndex) {
      console.log('\nDropping problematic index: workshopId_1_studentId_1');
      await collection.dropIndex('workshopId_1_studentId_1');
      console.log('Dropped successfully');
    }

    // Ensure the correct unique index exists
    const sessionStudentIndex = indexes.find(idx => idx.name === 'sessionId_1_studentId_1');
    if (!sessionStudentIndex) {
      console.log('\nCreating unique index: sessionId_1_studentId_1');
      await collection.createIndex(
        { sessionId: 1, studentId: 1 },
        { unique: true, name: 'sessionId_1_studentId_1' }
      );
      console.log('Created successfully');
    } else {
      console.log('\nIndex sessionId_1_studentId_1 already exists');
      // Drop and recreate to ensure it's truly unique (not sparse)
      if (sessionStudentIndex.sparse) {
        console.log('Recreating non-sparse unique index');
        await collection.dropIndex('sessionId_1_studentId_1');
        await collection.createIndex(
          { sessionId: 1, studentId: 1 },
          { unique: true, name: 'sessionId_1_studentId_1' }
        );
        console.log('Recreated successfully');
      }
    }

    // Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log('\nFinal indexes on workshopattendances:');
    finalIndexes.forEach(idx => {
      console.log(`  ${idx.name}:`, JSON.stringify(idx.key), idx.unique ? '(unique)' : '', idx.sparse ? '(sparse)' : '');
    });

    console.log('\n✅ Index fix complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing indexes:', err.message);
    process.exit(1);
  }
}

fixIndexes();
