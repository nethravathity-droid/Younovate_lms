const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://preethikanaik2_db_user:YounovateAtlas2026@cluster0.qfoml2r.mongodb.net/younovate_lms';
  await mongoose.connect(uri, { dbName: 'younovate_lms' });
  console.log('Connected to:', mongoose.connection.name);

  const Session = require('../src/models/Session');
  const User = require('../src/models/User');
  const Batch = require('../src/models/Batch');

  console.log('\n=== Dashboard queries explain ===');

  const queries = [
    { name: 'count trainees', q: () => User.countDocuments({ role: 'trainee', isActive: true }) },
    { name: 'count trainers', q: () => User.countDocuments({ role: 'trainer', isActive: true }) },
    { name: 'count batches', q: () => Batch.countDocuments({}) },
    { name: 'count active batches', q: () => Batch.countDocuments({ status: 'active' }) },
    { name: 'count sessions', q: () => Session.countDocuments({}) },
    { name: 'count registrations', q: () => User.countDocuments({ role: 'trainee', placementStatus: 'ready' }) },
    { name: 'recent users', q: () => User.find({ role: 'trainee' }).sort({ createdAt: -1 }).limit(8).select('name createdAt placementStatus') },
    { name: 'active batches list', q: () => Batch.find({ status: 'active' }).limit(6).select('name status') },
    { name: 'sessions LMS', q: () => Session.find({ sessionType: 'LMS' }).limit(200).lean() },
  ];

  for (const item of queries) {
    const start = Date.now();
    try {
      const result = await item.q();
      const ms = Date.now() - start;
      const count = Array.isArray(result) ? result.length : typeof result === 'object' && result.then ? 'async' : result;
      console.log(`  ${item.name}: ${ms}ms (${typeof count === 'number' ? count : 'ok'})`);
    } catch (e) {
      console.log(`  ${item.name}: ERROR - ${e.message}`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
