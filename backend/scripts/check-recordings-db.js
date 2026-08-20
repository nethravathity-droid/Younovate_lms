require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Recording = require('../src/models/Recording');
const Session = require('../src/models/Session');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const recordings = await Recording.find({}).sort({ createdAt: -1 }).limit(20).lean();
  console.log('All recordings:');
  recordings.forEach(r => {
    console.log(' -', r._id, '| session:', r.sessionId, '| egress:', r.egressId, '| status:', r.status, '| url:', r.url, '| filename:', r.filename);
  });
  const sessions = await Session.find({ recordingStatus: { $ne: 'none' } }).sort({ createdAt: -1 }).limit(10).lean();
  console.log('\nSessions with recordings:');
  sessions.forEach(s => {
    console.log(' -', s._id, s.title, '| status:', s.status, '| recordingStatus:', s.recordingStatus, '| egressId:', s.egressId, '| recordingUrl:', s.recordingUrl);
  });
  await mongoose.disconnect();
}
check().catch(e => { console.error(e); process.exit(1); });
