/**
 * Fix duplicate attendance records in MongoDB
 * 
 * This script:
 * 1. Finds duplicate attendance records (same sessionId + studentId)
 * 2. Keeps the most recent record, removes older duplicates
 * 3. Rebuilds the unique index
 */
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function fixDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
    console.log('Connected to MongoDB');

    const WorkshopAttendance = mongoose.model('WorkshopAttendance', new mongoose.Schema({
      sessionId: { type: mongoose.Schema.Types.ObjectId },
      studentId: { type: mongoose.Schema.Types.ObjectId },
      workshopId: { type: mongoose.Schema.Types.ObjectId },
      workshopBatchId: { type: mongoose.Schema.Types.ObjectId },
      attendanceStatus: String,
      joinTime: Date,
      leaveTime: Date,
      duration: Number,
      attendancePct: Number,
    }), 'workshopattendances');

    // Find duplicates
    const duplicates = await WorkshopAttendance.aggregate([
      {
        $group: {
          _id: { sessionId: '$sessionId', studentId: '$studentId' },
          count: { $sum: 1 },
          docs: { $push: { _id: '$_id', createdAt: '$createdAt' } },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    console.log(`Found ${duplicates.length} duplicate groups`);

    let removedCount = 0;
    for (const dup of duplicates) {
      // Sort docs by createdAt (keep the most recent)
      const sorted = dup.docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const keep = sorted[0];
      const remove = sorted.slice(1).map(d => d._id);

      console.log(`Removing ${remove.length} duplicates for session=${dup._id.sessionId}, student=${dup._id.studentId}`);
      await WorkshopAttendance.deleteMany({ _id: { $in: remove } });
      removedCount += remove.length;
    }

    console.log(`\n✅ Removed ${removedCount} duplicate records`);
    
    // Update records that have null workshopId
    const nullWorkshop = await WorkshopAttendance.countDocuments({ workshopId: null });
    console.log(`Records with null workshopId: ${nullWorkshop}`);
    
    if (nullWorkshop > 0) {
      // Try to fix by looking up the batch
      const fixable = await WorkshopAttendance.aggregate([
        { $match: { workshopId: null, workshopBatchId: { $ne: null } } },
        {
          $lookup: {
            from: 'workshopbatches',
            localField: 'workshopBatchId',
            foreignField: '_id',
            as: 'batch',
          },
        },
        { $unwind: { path: '$batch', preserveNullAndEmptyArrays: false } },
        { $match: { 'batch.workshopId': { $ne: null } } },
      ]);
      
      console.log(`Fixable records (batch has workshopId): ${fixable.length}`);
      
      for (const rec of fixable) {
        await WorkshopAttendance.findByIdAndUpdate(rec._id, { workshopId: rec.batch.workshopId });
        console.log(`Fixed record ${rec._id} -> workshopId=${rec.batch.workshopId}`);
      }
    }

    console.log('\n✅ Duplicate fix complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixDuplicates();
