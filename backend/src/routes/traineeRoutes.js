'use strict';
const express    = require('express');
const mongoose   = require('mongoose');
const Session    = require('../models/Session');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const WorkshopBatch = require('../models/WorkshopBatch');
const LmsFeedback = require('../models/LmsFeedback');
const { WorkshopAttendance, WorkshopCertificate } = require('../models/WorkshopModels');
const { protect, authorize } = require('../middleware/auth');

const {
  generateLiveKitToken,
  roomNameFor,
  LIVEKIT_URL,
} = require('../services/livekitService');
const { classifyAttendance } = require('../utils/attendanceUtils');
const {
  isLmsParticipant,
  isWorkshopParticipant,
  getWorkshopBatchIdsForUser,
  syncWorkshopStudent,
  optionalRatings,
} = require('../utils/participantValidation');

const router = express.Router();
router.use(protect, authorize('trainee'));

const LMS_FILTER = { $or: [{ sessionType: 'LMS' }, { sessionType: { $exists: false } }, { sessionType: null }] };

const traineeSessionFilter = (user) => ({
  $or: [
    { batchId:  { $in: user.batchIds || [] } },
    { trainees: user._id },
  ],
});

function ensureEnrolled(session, user) {
  const batchIds   = (user.batchIds || []).map(String);
  const inBatch    = session.batchId && batchIds.includes(String(session.batchId?._id || session.batchId));
  const isEnrolled = (session.trainees || []).some((t) => String(t?._id || t) === String(user._id));
  return inBatch || isEnrolled;
}

// GET /api/trainee/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const base = traineeSessionFilter(req.user);
    const userId = req.user._id;

    const [
      upcomingSessions,
      pendingAssignments,
      totalAttendance,
      presentAttendance,
      myWorkshopBatches,
      workshopUpcomingSessions,
      workshopLiveSessions,
      workshopAttendanceSummary,
      workshopCertificates,
    ] = await Promise.all([
      Session.find({ ...base, status: { $in: ['scheduled', 'live'] } })
        .populate('trainerId', 'name').sort('scheduledAt').limit(5),
      Assignment.countDocuments({ batchId: { $in: req.user.batchIds || [] }, status: 'active' }),
      Attendance.countDocuments({ trainee: userId }),
      Attendance.countDocuments({ trainee: userId, status: { $in: ['present', 'late'] } }),

      WorkshopBatch.find({ students: userId })
        .populate('workshopId', 'title date mode status')
        .sort({ createdAt: -1 })
        .lean(),

      (async () => {
        const myBatches = await WorkshopBatch.find({ students: userId }).select('_id').lean();
        const batchIds = myBatches.map(b => b._id);
        return Session.find({
          sessionType: 'WORKSHOP',
          workshopBatchId: { $in: batchIds },
          status: { $in: ['scheduled', 'live'] },
        })
          .populate('trainerId', 'name email profilePicture')
          .populate({ path: 'workshopBatchId', populate: { path: 'workshopId', select: 'title date mode' } })
          .sort({ scheduledAt: 1 })
          .limit(50)
          .lean();
      })(),

      (async () => {
        const myBatches = await WorkshopBatch.find({ students: userId }).select('_id').lean();
        const batchIds = myBatches.map(b => b._id);
        return Session.find({
          sessionType: 'WORKSHOP',
          workshopBatchId: { $in: batchIds },
          status: 'live',
        })
          .populate('trainerId', 'name email profilePicture')
          .populate({ path: 'workshopBatchId', populate: { path: 'workshopId', select: 'title date mode' } })
          .sort({ startedAt: -1 })
          .lean();
      })(),

      (async () => {
        const myBatches = await WorkshopBatch.find({ students: userId }).select('_id workshopId').lean();
        const batchIds = myBatches.map(b => b._id);
        const records = await WorkshopAttendance.find({
          workshopBatchId: { $in: batchIds },
          studentId: userId,
        }).lean();
        const total = records.length;
        const present = records.filter(r => r.attendanceStatus === 'Present' || r.attendanceStatus === 'Late').length;
        return { total, present, percentage: total ? ((present / total) * 100).toFixed(1) : '0.0' };
      })(),

      (async () => {
        const myBatches = await WorkshopBatch.find({ students: userId }).select('workshopId').lean();
        const workshopIds = myBatches.map(b => b.workshopId).filter(Boolean);
        return WorkshopCertificate.find({
          workshopId: { $in: workshopIds },
          studentId: userId,
        })
          .populate('workshopId', 'title')
          .sort({ createdAt: -1 })
          .lean();
      })(),
    ]);

    const pct = totalAttendance ? ((presentAttendance / totalAttendance) * 100).toFixed(1) : '0.0';

    return res.json({
      success: true,
      upcomingSessions,
      pendingAssignments,
      attendance: { total: totalAttendance, present: presentAttendance, percentage: pct },
      myWorkshopBatches,
      workshopUpcomingSessions,
      workshopLiveSessions,
      workshopAttendance: workshopAttendanceSummary,
      workshopCertificates,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/sessions?status=
// LMS sessions ONLY — Workshop sessions served by /api/trainee/workshop-sessions
router.get('/sessions', async (req, res) => {
  try {
    const attendedIds = await Attendance.find({ trainee: req.user._id }).distinct('session');
    const filter = {
      $and: [
        LMS_FILTER,
        {
          $or: [
            ...traineeSessionFilter(req.user).$or,
            ...(attendedIds.length ? [{ _id: { $in: attendedIds } }] : []),
          ],
        },
        ...(req.query.status ? [{ status: req.query.status }] : []),
      ],
    };
    const sessions = await Session.find(filter)
      .populate('trainerId', 'name profilePicture')
      .populate('batchId', 'name')
      .sort('-scheduledAt')
      .limit(50)
      .lean();

    const now = Date.now();
    const enriched = sessions.map(s => {
      const scheduledMs = new Date(s.scheduledAt).getTime();
      const joinBeforeMs = (s.joinBeforeMinutes || 10) * 60000;
      const endsAtMs = scheduledMs + (s.durationMinutes || 60) * 60000;
      const joinableFromMs = scheduledMs - joinBeforeMs;
      const canJoin = s.status === 'live' || (s.status === 'scheduled' && now >= joinableFromMs && now <= endsAtMs);
      const secondsUntilStart = Math.max(0, Math.round((joinableFromMs - now) / 1000));
      return { ...s, canJoin, secondsUntilStart, endsAt: new Date(endsAtMs).toISOString() };
    });

    return res.json({ success: true, sessions: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trainee/sessions/:id/join
router.post('/sessions/:id/join', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status !== 'live') {
      return res.status(409).json({ success: false, message: 'Session is not live yet' });
    }
    if (!ensureEnrolled(session, req.user)) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this session' });
    }
    if (session.passcode && req.body?.passcode !== session.passcode) {
      return res.status(403).json({ success: false, message: 'Invalid passcode' });
    }

    const roomName = roomNameFor(session._id);
    const token = await generateLiveKitToken(req.user, roomName, {
      canPublish: true, roomAdmin: false, roomRecord: false,
    });

    try {
      const now = new Date();
      let att = await Attendance.findOne({ session: session._id, trainee: req.user._id });
      if (!att) {
        att = new Attendance({ session: session._id, trainee: req.user._id, batch: session.batchId });
      }
      if (!att.joinedAt) att.joinedAt = now;
      const { status } = classifyAttendance({ session, joinedAt: att.joinedAt, leftAt: null });
      att.status = status; att.source = 'self'; att.markedAt = now;
      if (session.batchId && !att.batch) att.batch = session.batchId;
      await att.save();
    } catch (attErr) {
      console.warn('Attendance join-capture failed (joining anyway):', attErr.message);
    }

    return res.json({ success: true, token, url: LIVEKIT_URL, roomName, role: 'student', canPublish: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trainee/sessions/:id/attendance/leave
router.post('/sessions/:id/attendance/leave', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).select('scheduledAt durationMinutes batchId trainees');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (!ensureEnrolled(session, req.user)) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this session' });
    }

    const now = new Date();
    let att = await Attendance.findOne({ session: session._id, trainee: req.user._id });
    if (!att) {
      att = new Attendance({ session: session._id, trainee: req.user._id, batch: session.batchId, joinedAt: now });
    }
    att.leftAt = now;
    const { status, attendedSeconds } = classifyAttendance({ session, joinedAt: att.joinedAt || now, leftAt: now });
    att.status = status; att.attendedSeconds = attendedSeconds; att.source = 'self'; att.markedAt = now;
    if (session.batchId && !att.batch) att.batch = session.batchId;
    await att.save();

    return res.json({ success: true, record: { status: att.status, joinedAt: att.joinedAt, leftAt: att.leftAt, attendedSeconds: att.attendedSeconds } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find({ batchId: { $in: req.user.batchIds || [] }, status: { $ne: 'draft' } }).sort('-dueDate');
    const enriched = assignments.map((a) => {
      const sub = a.submissions.find((s) => s.trainee.toString() === req.user._id.toString());
      return { ...a.toObject(), mySubmission: sub || null };
    });
    return res.json({ success: true, assignments: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trainee/assignments/:id/submit
router.post('/assignments/:id/submit', async (req, res) => {
  try {
    const { submissionUrl, notes } = req.body;
    if (!submissionUrl) return res.status(400).json({ success: false, message: 'submissionUrl required' });
    const assignment = await Assignment.findOne({ _id: req.params.id, batchId: { $in: req.user.batchIds || [] }, status: 'active' });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found or closed' });
    assignment.submissions = assignment.submissions.filter((s) => s.trainee.toString() !== req.user._id.toString());
    assignment.submissions.push({ trainee: req.user._id, submissionUrl, notes: notes || '', submittedAt: new Date(), status: 'submitted' });
    await assignment.save();
    return res.status(201).json({ success: true, submission: assignment.submissions[assignment.submissions.length - 1] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/attendance
router.get('/attendance', async (req, res) => {
  try {
    const records = await Attendance.find({ trainee: req.user._id }).populate('session', 'title scheduledAt durationMinutes').sort({ createdAt: -1 });
    const total = records.length;
    const present = records.filter((r) => ['present', 'late'].includes(r.status)).length;
    return res.json({ success: true, records, stats: { total, present, percentage: total ? ((present / total) * 100).toFixed(1) : '0.0' } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/profile
router.get('/profile', (req, res) => res.json({ success: true, user: req.user.toPublic() }));

// WORKSHOP ROUTES

// GET /api/trainee/workshop-batches
router.get('/workshop-batches', async (req, res) => {
  try {
    const batchIds = await getWorkshopBatchIdsForUser(req.user._id, WorkshopBatch);
    if (!batchIds.length) return res.json({ success: true, batches: [] });
    const batches = await WorkshopBatch.find({ _id: { $in: batchIds } })
      .populate('workshopId', 'title date mode status')
      .populate('trainerId', 'name email profilePicture')
      .sort({ createdAt: -1 }).lean();
    return res.json({ success: true, batches });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/workshop-sessions
router.get('/workshop-sessions', async (req, res) => {
  try {
    const userId = req.user._id;
    const batchIds = await getWorkshopBatchIdsForUser(userId, WorkshopBatch);
    if (batchIds.length === 0) return res.json({ success: true, sessions: [] });

    const filter = { sessionType: 'WORKSHOP', workshopBatchId: { $in: batchIds } };
    if (req.query.status) filter.status = req.query.status;

    const sessions = await Session.find(filter)
      .populate('trainerId', 'name email profilePicture')
      .populate({ path: 'workshopBatchId', populate: { path: 'workshopId', select: 'title date mode' } })
      .sort({ scheduledAt: 1 }).lean();

    const now = Date.now();
    const enriched = sessions.map(s => {
      const scheduledMs = new Date(s.scheduledAt).getTime();
      const joinBeforeMs = (s.joinBeforeMinutes || 10) * 60000;
      const endsAtMs = scheduledMs + (s.durationMinutes || 60) * 60000;
      const joinableFromMs = scheduledMs - joinBeforeMs;
      const canJoin = s.status === 'live' || (s.status === 'scheduled' && now >= joinableFromMs && now <= endsAtMs);
      const secondsUntilStart = Math.max(0, Math.round((joinableFromMs - now) / 1000));
      return { ...s, canJoin, secondsUntilStart, endsAt: new Date(endsAtMs).toISOString() };
    });

    return res.json({ success: true, sessions: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trainee/workshop-sessions/:id/join
router.post('/workshop-sessions/:id/join', async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, sessionType: 'WORKSHOP' });
    if (!session) return res.status(404).json({ success: false, message: 'Workshop session not found' });

    const batch = await WorkshopBatch.findById(session.workshopBatchId).select('students workshopId registrationIds').lean();
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const isStudent = await isWorkshopParticipant(batch, session, req.user._id, WorkshopAttendance);
    if (!isStudent) return res.status(403).json({ success: false, message: 'You are not a participant of this session' });

    await syncWorkshopStudent(session.workshopBatchId, req.user._id, WorkshopBatch);

    if (!session.canJoin())
      return res.status(409).json({ success: false, message: 'Session is not joinable at this time', status: session.status });

    const roomName = roomNameFor(session._id);
    const token = await generateLiveKitToken(req.user, roomName, { canPublish: true, roomAdmin: false });

    // Validate required fields before upsert
    const attendanceData = {
      sessionId:        session._id,
      workshopBatchId:  session.workshopBatchId,
      workshopId:       batch.workshopId, // Resolved from batch - never null
      studentId:        req.user._id,
      attendanceStatus: 'Present',
      joinTime:         new Date(),
    };

    if (!attendanceData.sessionId || !attendanceData.studentId) {
      return res.status(500).json({ success: false, message: 'Cannot create attendance: missing session or student reference' });
    }

    try {
      await WorkshopAttendance.findOneAndUpdate(
        { sessionId: session._id, studentId: req.user._id },
        {
          $set: {
            joinTime: new Date(),
            attendanceStatus: 'Present',
            workshopBatchId: session.workshopBatchId,
            workshopId: batch.workshopId,
          },
          $setOnInsert: {
            sessionId: session._id,
            studentId: req.user._id,
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    } catch (attErr) {
      console.error('Attendance creation error:', attErr.message);
      // Non-blocking: allow join even if attendance fails
    }

    return res.json({ success: true, token, url: LIVEKIT_URL, roomName, role: 'student' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trainee/workshop-sessions/:id/leave
router.post('/workshop-sessions/:id/leave', async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, sessionType: 'WORKSHOP' }).lean();
    if (!session) return res.status(404).json({ success: false, message: 'Workshop session not found' });

    const now = new Date();
    const existing = await WorkshopAttendance.findOne({ sessionId: session._id, studentId: req.user._id });
    if (!existing) return res.json({ success: true, message: 'No attendance record found' });

    const joinTime = existing.joinTime || new Date(session.scheduledAt);
    const intervalMin = Math.max(0, Math.round((now.getTime() - joinTime.getTime()) / 60000));
    const totalMin = session.durationMinutes || 60;
    const newDuration = Math.min(existing.duration + intervalMin, totalMin);
    const pct = Math.min(100, Math.round((newDuration / totalMin) * 100));
    const status = pct >= 75 ? 'Present' : pct >= 25 ? 'Partial' : 'Absent';

    const updated = await WorkshopAttendance.findOneAndUpdate(
      { sessionId: session._id, studentId: req.user._id },
      { $set: { leaveTime: now, duration: newDuration, attendancePct: pct, attendanceStatus: status } },
      { new: true }
    );

    if (pct >= 60) {
      const batchDoc = await WorkshopBatch.findById(session.workshopBatchId).select('workshopId').lean();
      if (batchDoc?.workshopId) {
        await WorkshopCertificate.findOneAndUpdate(
          { workshopId: batchDoc.workshopId, studentId: req.user._id },
          { workshopId: batchDoc.workshopId, studentId: req.user._id, status: 'Eligible' },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    return res.json({ success: true, record: updated, attendancePct: pct, completionEligible: pct >= 60 });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/workshop-attendance
router.get('/workshop-attendance', async (req, res) => {
  try {
    const records = await WorkshopAttendance.find({ studentId: req.user._id })
      .populate({ path: 'sessionId', select: 'title scheduledAt durationMinutes' })
      .populate({ path: 'workshopId', select: 'title date mode' })
      .populate({ path: 'workshopBatchId', select: 'batchName' })
      .sort({ createdAt: -1 }).lean();
    const total = records.length;
    const present = records.filter(r => r.attendanceStatus === 'Present' || r.attendanceStatus === 'Late').length;
    return res.json({ success: true, records, stats: { total, present, percentage: total ? ((present / total) * 100).toFixed(1) : '0.0' } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/workshop-certificates
router.get('/workshop-certificates', async (req, res) => {
  try {
    const certificates = await WorkshopCertificate.find({ studentId: req.user._id })
      .populate('workshopId', 'title date mode')
      .sort({ createdAt: -1 }).lean();
    return res.json({ success: true, certificates });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════
// FEEDBACK ROUTES
// ═════════════════════════════════════════════════════════════════════

// POST /api/trainee/workshop-feedback
// Submit feedback for a completed workshop session
// One submission per trainee per workshop (enforced by unique index)
router.post('/workshop-feedback', async (req, res) => {
  try {
    const { sessionId, workshopId, overallRating, trainerRating, contentRating, audioRating, videoRating, comment, suggestions } = req.body;

    // Validate session exists and is completed
    const session = await Session.findOne({ _id: sessionId, sessionType: 'WORKSHOP' }).lean();
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted after session completion' });
    }

    const batch = await WorkshopBatch.findById(session.workshopBatchId).lean();
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    const isStudent = await isWorkshopParticipant(batch, session, req.user._id, WorkshopAttendance);
    if (!isStudent) return res.status(403).json({ success: false, message: 'You are not a participant of this session' });

    await syncWorkshopStudent(session.workshopBatchId, req.user._id, WorkshopBatch);

    const resolvedWorkshopId = batch.workshopId || workshopId;
    if (!resolvedWorkshopId) {
      return res.status(400).json({ success: false, message: 'Cannot determine workshop for this session' });
    }

    const WorkshopFeedback = mongoose.models.WorkshopFeedback || require('../models/WorkshopModels').WorkshopFeedback;
    const existing = await WorkshopFeedback.findOne({ sessionId, studentId: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: 'You have already submitted feedback for this session' });

    const { WorkshopFeedback: FeedbackModel } = require('../models/WorkshopModels');

    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return res.status(400).json({ success: false, message: 'Overall rating must be between 1 and 5' });
    }

    const feedback = await FeedbackModel.create({
      workshopId: resolvedWorkshopId,
      sessionId,
      studentId: req.user._id,
      trainerId: session.trainerId,
      rating: overallRating,
      ...optionalRatings({ trainerRating, contentRating, audioRating, videoRating }),
      comment: comment || '',
      suggestions: suggestions || '',
    });

    return res.status(201).json({ success: true, feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already submitted feedback for this workshop' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/workshop-feedback
// Get the trainee's feedback submissions
router.get('/workshop-feedback', async (req, res) => {
  try {
    const { WorkshopFeedback } = require('../models/WorkshopModels');
    const feedback = await WorkshopFeedback.find({ studentId: req.user._id })
      .populate('workshopId', 'title date')
      .sort({ createdAt: -1 }).lean();
    return res.json({ success: true, feedback });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════
// LMS FEEDBACK ROUTES (Teaching LMS)
// ═════════════════════════════════════════════════════════════════════

// POST /api/trainee/lms-feedback
// Submit feedback for a completed LMS session
// One submission per trainee per session (enforced by unique index)
router.post('/lms-feedback', async (req, res) => {
  try {
    const {
      sessionId,
      overallRating,
      trainerRating,
      contentRating,
      audioRating,
      videoRating,
      comment,
      suggestions,
    } = req.body;

    const session = await Session.findOne({
      _id: sessionId,
      ...LMS_FILTER,
    }).lean();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted after session completion',
      });
    }
    if (!(await isLmsParticipant(session, req.user, Attendance))) {
      return res.status(403).json({ success: false, message: 'You are not a participant of this session' });
    }
    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return res.status(400).json({ success: false, message: 'Overall rating must be between 1 and 5' });
    }

    const existing = await LmsFeedback.findOne({ sessionId, studentId: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted feedback for this session' });
    }

    const feedback = await LmsFeedback.create({
      sessionId,
      studentId: req.user._id,
      trainerId: session.trainerId,
      rating: overallRating,
      ...optionalRatings({ trainerRating, contentRating, audioRating, videoRating }),
      comment: comment || '',
      suggestions: suggestions || '',
    });

    return res.status(201).json({ success: true, feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already submitted feedback for this session' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/lms-feedback
// Get the trainee's LMS feedback submissions
router.get('/lms-feedback', async (req, res) => {
  try {
    const feedback = await LmsFeedback.find({ studentId: req.user._id })
      .populate('sessionId', 'title scheduledAt sessionType')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, feedback });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/workshop-sessions/:id/join-status
// Returns the join state for a trainee for a specific session
router.get('/workshop-sessions/:id/join-status', async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, sessionType: 'WORKSHOP' }).lean();
    if (!session) return res.status(404).json({ success: false, message: 'Workshop session not found' });

    const now = Date.now();
    const scheduledMs = new Date(session.scheduledAt).getTime();
    const endsAtMs = scheduledMs + (session.durationMinutes || 60) * 60000;
    const joinBeforeMs = (session.joinBeforeMinutes || 10) * 60000;
    const joinableFromMs = scheduledMs - joinBeforeMs;

    let joinState = 'scheduled';
    let canJoin = false;
    let message = '';

    if (session.status === 'completed') {
      joinState = 'completed';
      canJoin = false;
      message = 'Session Completed';
    } else if (session.status === 'live') {
      joinState = 'live';
      canJoin = true;
      message = 'Join Session';
    } else if (now < joinableFromMs) {
      joinState = 'scheduled';
      canJoin = false;
      const secondsUntilStart = Math.ceil((joinableFromMs - now) / 1000);
      message = `Scheduled - Starts in ${Math.floor(secondsUntilStart / 60)}m ${secondsUntilStart % 60}s`;
    } else if (now >= joinableFromMs && session.status === 'scheduled') {
      joinState = 'waiting';
      canJoin = false;
      message = 'Waiting for Trainer';
    } else if (now > endsAtMs) {
      joinState = 'completed';
      canJoin = false;
      message = 'Session Completed';
    }

    const secondsUntilStart = Math.max(0, Math.ceil((scheduledMs - now) / 1000));
    const secondsUntilEnd = Math.max(0, Math.ceil((endsAtMs - now) / 1000));
    const isWithinJoinWindow = now >= joinableFromMs && now <= endsAtMs;

    return res.json({
      success: true,
      joinState,
      canJoin,
      message,
      secondsUntilStart,
      secondsUntilEnd,
      isWithinJoinWindow,
      session: {
        _id: session._id,
        status: session.status,
        scheduledAt: session.scheduledAt,
        durationMinutes: session.durationMinutes,
        title: session.title,
      },
    });
   } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainee/sessions/:id/join-status
// LMS session join state (mirrors the workshop endpoint but for LMS sessions)
router.get('/sessions/:id/join-status', async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, ...LMS_FILTER }).lean();
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (!ensureEnrolled(session, req.user)) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this session' });
    }

    const now = Date.now();
    const scheduledMs = new Date(session.scheduledAt).getTime();
    const endsAtMs = scheduledMs + (session.durationMinutes || 60) * 60000;
    const joinBeforeMs = (session.joinBeforeMinutes || 10) * 60000;
    const joinableFromMs = scheduledMs - joinBeforeMs;

    let joinState = 'scheduled';
    let canJoin = false;
    let message = '';

    if (session.status === 'completed') {
      joinState = 'completed';
      canJoin = false;
      message = 'Session Completed';
    } else if (session.status === 'live') {
      joinState = 'live';
      canJoin = true;
      message = 'Join Session';
    } else if (now < joinableFromMs) {
      joinState = 'scheduled';
      canJoin = false;
      const secondsUntilStart = Math.ceil((joinableFromMs - now) / 1000);
      message = `Scheduled - Starts in ${Math.floor(secondsUntilStart / 60)}m ${secondsUntilStart % 60}s`;
    } else if (now >= joinableFromMs && session.status === 'scheduled') {
      joinState = 'waiting';
      canJoin = false;
      message = 'Waiting for Trainer';
    } else if (now > endsAtMs) {
      joinState = 'completed';
      canJoin = false;
      message = 'Session Completed';
    }

    const secondsUntilStart = Math.max(0, Math.ceil((scheduledMs - now) / 1000));
    const secondsUntilEnd = Math.max(0, Math.ceil((endsAtMs - now) / 1000));
    const isWithinJoinWindow = now >= joinableFromMs && now <= endsAtMs;

    return res.json({
      success: true,
      joinState,
      canJoin,
      message,
      secondsUntilStart,
      secondsUntilEnd,
      isWithinJoinWindow,
      session: {
        _id: session._id,
        status: session.status,
        scheduledAt: session.scheduledAt,
        durationMinutes: session.durationMinutes,
        title: session.title,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
