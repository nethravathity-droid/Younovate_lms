const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/younovate_lms', { dbName: 'younovate_lms' });
    console.log('Connected');
    
    const User = require('../src/models/User');
    const Batch = require('../src/models/Batch');
    const Assignment = require('../src/models/Assignment');
    
    const trainer = await User.findOne({ email: 'trainer@younovate.in' });
    const batch = await Batch.findOne({ name: 'Demo Batch 2026' });
    
    console.log('Trainer:', trainer._id);
    console.log('Batch:', batch._id);
    
    const assignment = await Assignment.findOneAndUpdate(
      { title: 'Test Assignment', batchId: batch._id, createdBy: trainer._id },
      {
        title: 'Test Assignment',
        description: 'Test desc',
        instructions: 'Test instructions',
        batchId: batch._id,
        createdBy: trainer._id,
        dueDate: new Date(Date.now() + 86400000 * 5),
        maxScore: 100,
        status: 'active',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    console.log('Assignment result:', assignment.title, assignment._id);
    
    const count = await Assignment.countDocuments({});
    console.log('Total assignments in DB:', count);
    
    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
