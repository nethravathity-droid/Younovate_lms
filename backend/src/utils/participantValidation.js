'use strict';

const { WorkshopPublicRegistration } = require('../models/WorkshopModels');

function idStr(val) {
  if (val == null) return '';
  if (typeof val === 'object' && val._id != null) return String(val._id);
  return String(val);
}

/** LMS: batch enrollment or explicit session trainee list. */
function isEnrolledInLmsSession(session, user) {
  const userId = idStr(user._id);
  const batchIds = (user.batchIds || []).map(idStr);
  const sessionBatchId = idStr(session.batchId);
  const inBatch = sessionBatchId && batchIds.includes(sessionBatchId);
  const inTrainees = (session.trainees || []).some((t) => idStr(t) === userId);
  return inBatch || inTrainees;
}

/** LMS: attended the live session (attendance record). */
async function hasLmsAttendance(Attendance, sessionId, userId) {
  const att = await Attendance.findOne({ session: sessionId, trainee: userId })
    .select('joinedAt status')
    .lean();
  if (!att) return false;
  return !!att.joinedAt || ['present', 'late', 'partial'].includes(att.status);
}

/** LMS participant = enrolled OR has attendance for the session. */
async function isLmsParticipant(session, user, Attendance) {
  if (isEnrolledInLmsSession(session, user)) return true;
  return hasLmsAttendance(Attendance, session._id, user._id);
}

/** Workshop batch membership via students[] or approved registration.userId. */
async function isWorkshopBatchMember(batch, userId) {
  const uid = idStr(userId);
  if ((batch.students || []).some((s) => idStr(s) === uid)) return true;

  const regIds = batch.registrationIds || [];
  if (!regIds.length) return false;

  const count = await WorkshopPublicRegistration.countDocuments({
    _id: { $in: regIds },
    userId,
    registrationStatus: 'Approved',
  });
  return count > 0;
}

/** Workshop: joined the session (attendance record). */
async function hasWorkshopAttendance(WorkshopAttendance, sessionId, userId) {
  const att = await WorkshopAttendance.findOne({ sessionId, studentId: userId })
    .select('joinTime attendanceStatus')
    .lean();
  if (!att) return false;
  return !!att.joinTime || ['Present', 'Late', 'Partial'].includes(att.attendanceStatus);
}

/** Workshop participant = batch member OR has session attendance. */
async function isWorkshopParticipant(batch, session, userId, WorkshopAttendance) {
  if (await isWorkshopBatchMember(batch, userId)) return true;
  if (session?._id) return hasWorkshopAttendance(WorkshopAttendance, session._id, userId);
  return false;
}

/** Batch IDs the user belongs to (students[] or approved registration). */
async function getWorkshopBatchIdsForUser(userId, WorkshopBatch) {
  const direct = await WorkshopBatch.find({ students: userId }).select('_id').lean();
  const ids = new Set(direct.map((b) => idStr(b._id)));

  const regs = await WorkshopPublicRegistration.find({
    userId,
    registrationStatus: 'Approved',
  }).select('_id').lean();

  if (regs.length) {
    const regIds = regs.map((r) => r._id);
    const viaReg = await WorkshopBatch.find({ registrationIds: { $in: regIds } }).select('_id').lean();
    viaReg.forEach((b) => ids.add(idStr(b._id)));
  }

  return [...ids];
}

/** Keep students[] in sync when user is a valid approved registrant. */
async function syncWorkshopStudent(batchId, userId, WorkshopBatch) {
  const batch = await WorkshopBatch.findById(batchId).select('students registrationIds').lean();
  if (!batch) return;
  if (await isWorkshopBatchMember(batch, userId)) {
    await WorkshopBatch.findByIdAndUpdate(batchId, { $addToSet: { students: userId } });
  }
}

/** Optional sub-ratings: schema allows 0 = not provided. */
function optionalRatings({ trainerRating, contentRating, audioRating, videoRating }) {
  const out = {};
  const set = (k, v) => { if (v != null && Number(v) >= 1) out[k] = Number(v); };
  set('trainerRating', trainerRating);
  set('contentRating', contentRating);
  set('audioRating', audioRating);
  set('videoRating', videoRating);
  return out;
}

module.exports = {
  idStr,
  isEnrolledInLmsSession,
  isLmsParticipant,
  isWorkshopBatchMember,
  isWorkshopParticipant,
  getWorkshopBatchIdsForUser,
  syncWorkshopStudent,
  optionalRatings,
};
