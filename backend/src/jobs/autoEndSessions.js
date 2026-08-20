// src/jobs/autoEndSessions.js  — call once at startup
const cron = require('node-cron');               // npm i node-cron
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Recording = require('../models/Recording');
const { stopRecording } = require('../services/livekitService');
const { finalizeAttendanceOnEnd } = require('../utils/attendanceUtils');

cron.schedule('* * * * *', async () => {          // every minute
  const due = await Session.find({ status: 'live', autoEnd: true });
  for (const s of due) {
    if (s.isOver()) {
      const endedAt = new Date();
      let durationSeconds = 0;

      // Stop active recording and update Recording document
      if (s.egressId) {
        try { await stopRecording(s.egressId); } catch (_) {}
        try {
          const rec = await Recording.findOne({ egressId: s.egressId }).lean();
          if (rec && rec.startedAt) {
            durationSeconds = Math.round((endedAt.getTime() - new Date(rec.startedAt).getTime()) / 1000);
          } else if (s.startedAt) {
            durationSeconds = Math.round((endedAt.getTime() - new Date(s.startedAt).getTime()) / 1000);
          }
          await Recording.findOneAndUpdate(
            { egressId: s.egressId },
            { $set: { endedAt, durationSeconds, status: rec?.status === 'completed' ? 'completed' : 'processing' } }
          );
        } catch (_) {}
      }

      s.status = 'completed';
      s.recordingStatus = s.recordingStatus === 'recording' ? 'processing' : s.recordingStatus;
      s.endedAt = endedAt;
      await s.save();

      // Finalize attendance for trainees still in the room
      try {
        await finalizeAttendanceOnEnd(Attendance, s._id, endedAt, s);
      } catch (finalizeErr) {
        console.warn('autoEnd: attendance finalization failed:', finalizeErr.message);
      }
    }
  }
});