const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://preethikanaik2_db_user:YounovateAtlas2026@cluster0.qfoml2r.mongodb.net/younovate_lms';
  await mongoose.connect(uri, { dbName: 'younovate_lms' });
  console.log('Connected to:', mongoose.connection.name);

  const User = require('../src/models/User');
  const Batch = require('../src/models/Batch');
  const Session = require('../src/models/Session');
  const Registration = require('../src/models/Registration');
  const Attendance = require('../src/models/Attendance');

  console.log('\n=== Collection Counts ===');
  console.log('Users:', await User.countDocuments({}));
  console.log('Trainees:', await User.countDocuments({ role: 'trainee', isActive: true }));
  console.log('Trainers:', await User.countDocuments({ role: 'trainer', isActive: true }));
  console.log('Batches:', await Batch.countDocuments({}));
  console.log('Sessions:', await Session.countDocuments({}));
  console.log('Registrations:', await Registration.countDocuments({}));
  console.log('Attendance:', await Attendance.countDocuments({}));

  console.log('\n=== Session types ===');
  const types = await Session.aggregate([{ $group: { _id: '$sessionType', count: { $sum: 1 } } }]);
  types.forEach(t => console.log(`  ${t._id}: ${t.count}`));

  console.log('\n=== Batch statuses ===');
  const batchStatuses = await Batch.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  batchStatuses.forEach(t => console.log(`  ${t._id}: ${t.count}`));

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
