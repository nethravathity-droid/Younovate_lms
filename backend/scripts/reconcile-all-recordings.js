require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Recording = require('../src/models/Recording');
const { reconcileRecordingByEgressId } = require('../src/utils/recordingStorage');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
  const recs = await Recording.find({ egressId: { $exists: true, $ne: '' } }).lean();
  let ok = 0;
  for (const r of recs) {
    const u = await reconcileRecordingByEgressId(r.egressId, { maxAttempts: 1 });
    if (u && u.status === 'completed') {
      ok++;
      console.log('OK', String(r._id), u.roomName, u.url);
    }
  }
  console.log(`reconciled ${ok} of ${recs.length}`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
