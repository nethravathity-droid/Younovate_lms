require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Recording = require('../src/models/Recording');
const Session = require('../src/models/Session');

async function fixAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:8080';

  let fixedRecordings = 0;
  let fixedSessions = 0;

  const recordings = await Recording.find({}).lean();
  for (const r of recordings) {
    const filename = (r.filename || '').replace(/^\/out\//, '').replace(/^\/+/, '');
    if (!filename) continue;
    const correctUrl = `${baseUrl}/recordings/${filename}`;
    if (r.url !== correctUrl) {
      await Recording.findByIdAndUpdate(r._id, { url: correctUrl });
      fixedRecordings++;
      console.log(`Fixed Recording ${r._id}: ${r.url} → ${correctUrl}`);
    }
  }

  const sessions = await Session.find({ recordingUrl: { $exists: true, $ne: '' } }).lean();
  for (const s of sessions) {
    const rec = await Recording.findOne({ sessionId: s._id }).lean();
    if (!rec || !rec.filename) continue;
    const filename = rec.filename.replace(/^\/out\//, '').replace(/^\/+/, '');
    const correctUrl = `${baseUrl}/recordings/${filename}`;
    if (s.recordingUrl !== correctUrl) {
      await Session.findByIdAndUpdate(s._id, { recordingUrl: correctUrl });
      fixedSessions++;
      console.log(`Fixed Session ${s._id}: ${s.recordingUrl} → ${correctUrl}`);
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Recordings fixed: ${fixedRecordings}`);
  console.log(`  Sessions fixed:   ${fixedSessions}`);

  await mongoose.disconnect();
}

fixAll().catch(e => { console.error(e); process.exit(1); });
