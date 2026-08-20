require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Recording = require('../src/models/Recording');
const Session = require('../src/models/Session');
const fs = require('fs');
const path = require('path');

async function fixRecordings() {
  await mongoose.connect(process.env.MONGODB_URI);
  const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:8080';
  const recordingsDir = path.join(__dirname, '..', '..', 'lms-recordings');

  let fixedUrls = 0;
  let fixedStatus = 0;
  let processedMp4s = 0;

  const recordings = await Recording.find({}).lean();
  console.log(`Found ${recordings.length} recordings in MongoDB`);

  for (const r of recordings) {
    let updated = false;
    const update = {};

    // Fix URL from filename if URL is empty or wrong
    if (!r.url && r.filename) {
      const relPath = r.filename.replace(/^\/out\//, '').replace(/^\/+/, '');
      update.url = `${baseUrl}/recordings/${relPath}`;
      updated = true;
    } else if (r.url && r.url.includes('/out/')) {
      const relPath = r.url.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/+/, '').replace(/^recordings\//, '').replace(/^out\//, '').replace(/^\/+/, '');
      update.url = `${baseUrl}/recordings/${relPath}`;
      updated = true;
    }

    // If filename is empty but roomName exists, search for MP4 in room directory
    let relPath = (r.filename || '').replace(/^\/out\//, '').replace(/^\/+/, '');
    if (!relPath && r.roomName) {
      const roomDir = path.join(recordingsDir, r.roomName);
      if (fs.existsSync(roomDir) && fs.statSync(roomDir).isDirectory()) {
        const mp4s = fs.readdirSync(roomDir).filter(f => f.endsWith('.mp4'));
        if (mp4s.length > 0) {
          relPath = `${r.roomName}/${mp4s[0]}`;
          update.filename = `/out/${relPath}`;
          update.url = `${baseUrl}/recordings/${relPath}`;
          updated = true;
        }
      }
    }

    // Verify file exists for completed/available recordings
    const filePath = path.join(recordingsDir, relPath);
    const fileExists = relPath ? fs.existsSync(filePath) && fs.statSync(filePath).size > 0 : false;

    if ((r.status === 'available' || r.status === 'completed') && !fileExists) {
      update.status = 'failed';
      update.error = 'File missing on disk during repair scan';
      updated = true;
    } else if ((r.status === 'processing' || r.status === 'active') && fileExists) {
      update.status = 'completed';
      update.error = '';
      updated = true;
    }

    if (updated) {
      await Recording.findByIdAndUpdate(r._id, { $set: update });
      fixedUrls++;
      console.log(`Fixed Recording ${r._id}: ${r.url || '(empty)'} → ${update.url || '(unchanged)'} | status: ${r.status} → ${update.status || '(unchanged)'}`);
    }

    // Process MP4 with ffmpeg faststart if needed
    if (fileExists && (r.status === 'completed' || r.status === 'available')) {
      try {
        const { execSync } = require('child_process');
        const fastStartPath = filePath + '.faststart.mp4';
        execSync(
          `"${process.env.FFMPEG_PATH || 'ffmpeg'}" -i "${filePath}" -c copy -movflags +faststart "${fastStartPath}" -y`,
          { stdio: 'ignore', timeout: 120000 }
        );
        if (fs.existsSync(fastStartPath) && fs.statSync(fastStartPath).size > 0) {
          fs.renameSync(fastStartPath, filePath);
          processedMp4s++;
          console.log(`  Fast-start applied: ${relPath}`);
        } else if (fs.existsSync(fastStartPath)) {
          fs.unlinkSync(fastStartPath);
        }
      } catch (_) {
        // ffmpeg not available or failed
      }
    }
  }

  // Also fix Session recordingUrl fields
  const sessions = await Session.find({ recordingUrl: { $exists: true, $ne: '' } }).lean();
  for (const s of sessions) {
    const rec = await Recording.findOne({ sessionId: s._id }).lean();
    if (!rec || !rec.filename) continue;
    const filename = rec.filename.replace(/^\/out\//, '').replace(/^\/+/, '');
    const correctUrl = `${baseUrl}/recordings/${filename}`;
    if (s.recordingUrl !== correctUrl) {
      await Session.findByIdAndUpdate(s._id, { recordingUrl: correctUrl });
      fixedUrls++;
      console.log(`Fixed Session ${s._id}: ${s.recordingUrl} → ${correctUrl}`);
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Recordings/Sessions fixed: ${fixedUrls}`);
  console.log(`  Status corrections: ${fixedStatus}`);
  console.log(`  MP4 fast-start processed: ${processedMp4s}`);

  await mongoose.disconnect();
}

fixRecordings().catch(e => { console.error(e); process.exit(1); });
