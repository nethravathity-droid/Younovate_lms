// routes/livekit.js — role derived from the session, not the request body
'use strict';
const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const Session = require('../models/Session');
const WorkshopBatch = require('../models/WorkshopBatch');
const { protect } = require('../middleware/auth');
const router = express.Router();

const ROLE_GRANTS = {
  trainer: { canPublish: true,  canSubscribe: true, canPublishData: true, roomAdmin: true },
  student: { canPublish: true,  canSubscribe: true, canPublishData: true },
};

// POST /api/livekit/token
// body: { room }  where room === `session_<sessionId>`
router.post('/token', protect, async (req, res) => {
  try {
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      try { body = JSON.parse(body.toString('utf8')); } catch { body = {}; }
    }
    const { room, sessionId: bodySessionId } = body || {};
    const roomKey = room || (bodySessionId ? `session_${bodySessionId}` : '');
    if (!roomKey) return res.status(400).json({ message: 'room is required' });

    const apiKey    = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl     = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return res.status(500).json({ message: 'LiveKit server is not configured' });
    }

    const sessionId = String(roomKey).replace(/^session_/, '');
    const session = await Session.findById(sessionId).lean();
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const userId    = req.user._id.toString();
    const isTrainer = String(session.trainerId) === userId;

    let isParticipant = false;

    if (session.sessionType === 'WORKSHOP') {
      // Workshop: check batch.students array
      if (session.workshopBatchId) {
        const batch = await WorkshopBatch.findById(session.workshopBatchId).select('students').lean();
        isParticipant = (batch?.students || []).some(s => s.toString() === userId);
      }
    } else {
      // LMS: check session.trainees array
      isParticipant = (session.trainees || []).some(t => String(t) === userId);
    }

    if (!isTrainer && !isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not part of this session' });
    }

    const role   = isTrainer || req.user.role === 'admin' ? 'trainer' : 'student';
    const grants = ROLE_GRANTS[role];

    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: req.user.name || (role === 'trainer' ? 'Trainer' : 'Trainee'),
      ttl: '2h',
    });
    at.addGrant({ roomJoin: true, room: roomKey, ...grants });

    const token = await at.toJwt();
    return res.json({ token, url: wsUrl, role });
  } catch (err) {
    console.error('LiveKit token error →', err);
    return res.status(500).json({ message: err.message || 'Failed to generate token' });
  }
});

module.exports = router;
