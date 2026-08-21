'use strict';

const express = require('express');
const Course = require('../models/Course');
const Session = require('../models/Session');
const User = require('../models/User');
const Workshop = require('../models/Workshop');
const WorkshopBatch = require('../models/WorkshopBatch');
const Batch = require('../models/Batch');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const LMS_FILTER = { $or: [{ sessionType: 'LMS' }, { sessionType: { $exists: false } }, { sessionType: null }] };

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function textFilter(q) {
  const rx = new RegExp(escapeRegex(q), 'i');
  return rx;
}

// GET /api/search?q=workshop
router.get('/', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ success: true, query: q, results: [] });
    }

    const user = req.user;
    const rx = textFilter(q);
    const results = [];

    if (user.role === 'trainee') {
      const batchIds = user.batchIds || [];
      const batches = await Batch.find({ _id: { $in: batchIds } })
        .select('name course')
        .populate('course', 'name code')
        .lean();

      batches
        .filter((b) => rx.test(b.name || '') || rx.test(b.course?.name || '') || rx.test(b.course?.code || ''))
        .slice(0, 8)
        .forEach((b) => {
          if (b.course?._id) {
            results.push({
              type: 'course',
              title: b.course.name,
              subtitle: b.name || b.course?.code || 'Course',
              href: `/trainee/coursess/${b.course._id}`,
            });
          }
        });

      const sessions = await Session.find({
        ...LMS_FILTER,
        $or: [{ batchId: { $in: batchIds } }, { trainees: user._id }],
        title: rx,
      })
        .select('title status scheduledAt')
        .sort({ scheduledAt: -1 })
        .limit(8)
        .lean();

      sessions.forEach((s) => {
        results.push({
          type: 'session',
          title: s.title,
          subtitle: s.status,
          href: '/trainee/sessions',
        });
      });

      const workshopBatches = await WorkshopBatch.find({ students: user._id })
        .populate('workshopId', 'title mode status')
        .lean();

      workshopBatches
        .filter((wb) => rx.test(wb.workshopId?.title || '') || rx.test(wb.name || ''))
        .slice(0, 8)
        .forEach((wb) => {
          results.push({
            type: 'workshop',
            title: wb.workshopId?.title || wb.name || 'Workshop',
            subtitle: wb.workshopId?.mode || 'Workshop',
            href: '/trainee/sessions',
          });
        });
    } else if (user.role === 'trainer') {
      const trainerId = user._id;

      const [sessions, workshopBatches, workshops] = await Promise.all([
        Session.find({ trainerId, title: rx, ...LMS_FILTER })
          .select('title status scheduledAt')
          .sort({ scheduledAt: -1 })
          .limit(8)
          .lean(),
        WorkshopBatch.find({ trainerId })
          .populate('workshopId', 'title')
          .lean(),
        Workshop.find({ trainerId, $or: [{ title: rx }, { trainerName: rx }] })
          .select('title status mode')
          .limit(8)
          .lean(),
      ]);

      sessions.forEach((s) => {
        results.push({
          type: 'session',
          title: s.title,
          subtitle: s.status,
          href: `/trainer/sessions/${s._id}`,
        });
      });

      workshopBatches
        .filter((wb) => rx.test(wb.workshopId?.title || '') || rx.test(wb.name || ''))
        .slice(0, 8)
        .forEach((wb) => {
          results.push({
            type: 'workshop',
            title: wb.workshopId?.title || wb.name || 'Workshop batch',
            subtitle: 'Workshop batch',
            href: '/trainer/workshops',
          });
        });

      workshops.forEach((w) => {
        results.push({
          type: 'workshop',
          title: w.title,
          subtitle: w.status || w.mode || 'Workshop',
          href: '/trainer/workshops',
        });
      });
    } else if (user.role === 'admin') {
      const [courses, workshops, users, batches] = await Promise.all([
        Course.find({ $or: [{ name: rx }, { code: rx }] })
          .select('name code status')
          .limit(8)
          .lean(),
        Workshop.find({ $or: [{ title: rx }, { trainerName: rx }] })
          .select('title status trainerName')
          .limit(8)
          .lean(),
        User.find({ $or: [{ name: rx }, { email: rx }] })
          .select('name email role')
          .limit(8)
          .lean(),
        Batch.find({ name: rx })
          .select('name status')
          .limit(8)
          .lean(),
      ]);

      courses.forEach((c) => {
        results.push({
          type: 'course',
          title: c.name,
          subtitle: c.code || c.status,
          href: `/admin/courses/${c._id}`,
        });
      });

      workshops.forEach((w) => {
        results.push({
          type: 'workshop',
          title: w.title,
          subtitle: w.trainerName || w.status,
          href: `/admin/workshops/management/${w._id}`,
        });
      });

      users.forEach((u) => {
        results.push({
          type: 'user',
          title: u.name,
          subtitle: `${u.email} · ${u.role}`,
          href: '/admin/users',
        });
      });

      batches.forEach((b) => {
        results.push({
          type: 'batch',
          title: b.name,
          subtitle: b.status || 'Batch',
          href: '/admin/batches',
        });
      });
    } else if (user.role === 'hr') {
      const trainees = await User.find({
        role: 'trainee',
        $or: [{ name: rx }, { email: rx }],
      })
        .select('name email placementStatus')
        .limit(12)
        .lean();

      trainees.forEach((t) => {
        results.push({
          type: 'trainee',
          title: t.name,
          subtitle: `${t.email}${t.placementStatus ? ` · ${t.placementStatus}` : ''}`,
          href: '/hr/pipeline',
        });
      });
    }

    return res.json({ success: true, query: q, results });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
