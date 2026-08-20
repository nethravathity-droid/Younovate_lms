// src/utils/seed.js — complete idempotent development dataset
'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User         = require('../models/User');
const Batch        = require('../models/Batch');
const Session      = require('../models/Session');
const Attendance   = require('../models/Attendance');
const Assignment   = require('../models/Assignment');
const Registration = require('../models/Registration');
const Workshop     = require('../models/Workshop');
const WorkshopBatch = require('../models/WorkshopBatch');
const { WorkshopRegistration, WorkshopAttendance, WorkshopFeedback, WorkshopCertificate } = require('../models/WorkshopModels');
const LmsFeedback  = require('../models/LmsFeedback');
const Course       = require('../models/Course');

const BCRYPT_COST = 10;

const hash = (pw) => bcrypt.hashSync(pw, BCRYPT_COST);

async function ensureUser({ email, password, role, batchIds = [], ...rest }) {
  const user = await User.findOneAndUpdate(
    { email },
    {
      email,
      password: hash(password),
      role,
      batchIds,
      isActive: true,
      accountStatus: 'Active',
      ...rest,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return user;
}

async function ensureBatch(name, overrides = {}) {
  const batch = await Batch.findOneAndUpdate(
    { name },
    { name, startDate: new Date(), status: 'active', ...overrides },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return batch;
}

async function ensureCourse(code, name, overrides = {}) {
  const course = await Course.findOneAndUpdate(
    { code },
    { code, name, status: 'active', ...overrides },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return course;
}

async function ensureSession(title, { batchId, trainerId, status = 'scheduled', sessionType = 'LMS', trainees = [], ...overrides }) {
  const session = await Session.findOneAndUpdate(
    { title, batchId, trainerId, sessionType },
    {
      title,
      batchId,
      trainerId,
      status,
      sessionType,
      trainees,
      scheduledAt: new Date(Date.now() + 86400000),
      durationMinutes: 60,
      ...overrides,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return session;
}

async function ensureWorkshop(title, { trainerId, status = 'Published', ...overrides }) {
  const workshop = await Workshop.findOneAndUpdate(
    { title },
    {
      title,
      trainerId,
      status,
      published: status === 'Published',
      registrationOpen: true,
      maxSeats: 100,
      availableSeats: 100,
      date: new Date(Date.now() + 86400000),
      ...overrides,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return workshop;
}

async function ensureWorkshopBatch(workshopId, batchCode, batchName, { trainerId, students = [], ...overrides }) {
  const wb = await WorkshopBatch.findOneAndUpdate(
    { batchCode },
    {
      workshopId,
      batchCode,
      batchName,
      trainerId: trainerId || null,
      students,
      status: 'Scheduled',
      startDate: new Date(Date.now() + 86400000),
      ...overrides,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return wb;
}

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'younovate_lms' });
  console.log('✅  Connected');

  // ── 1. USERS ──────────────────────────────────────────────────────────────
  console.log('\n👥  Seeding users...');
  const admin = await ensureUser({
    email: 'admin@younovate.in',
    password: 'Admin@1234',
    role: 'admin',
    name: 'Admin Demo',
  });

  const trainer = await ensureUser({
    email: 'trainer@younovate.in',
    password: 'Trainer@1234',
    role: 'trainer',
    name: 'Trainer Demo',
  });

  const trainerB = await ensureUser({
    email: 'trainerb@younovate.in',
    password: 'TrainerB@1234',
    role: 'trainer',
    name: 'Trainer B Demo',
  });

  const trainee = await ensureUser({
    email: 'trainee@younovate.in',
    password: 'Trainee@1234',
    role: 'trainee',
    name: 'Trainee Demo',
  });

  const hr = await ensureUser({
    email: 'hr@younovate.in',
    password: 'Hr@12345678',
    role: 'hr',
    name: 'HR Demo',
  });

  // Additional demo users for richer data
  const trainerC = await ensureUser({
    email: 'trainerc@younovate.in',
    password: 'TrainerC@1234',
    role: 'trainer',
    name: 'Trainer C Demo',
  });

  const trainee2 = await ensureUser({
    email: 'trainee2@younovate.in',
    password: 'Trainee2@1234',
    role: 'trainee',
    name: 'Trainee Two Demo',
  });

  const trainee3 = await ensureUser({
    email: 'trainee3@younovate.in',
    password: 'Trainee3@1234',
    role: 'trainee',
    name: 'Trainee Three Demo',
  });

  console.log('   Users ensured:', { admin: admin.email, trainer: trainer.email, trainerB: trainerB.email, trainerC: trainerC.email, trainee: trainee.email, trainee2: trainee2.email, trainee3: trainee3.email, hr: hr.email });

  // ── 2. BATCHES ────────────────────────────────────────────────────────────
  console.log('\n🗂️   Seeding batches...');
  const batchDemo = await ensureBatch('Demo Batch 2026', { course: 'Full Stack Development', trainerId: trainer._id });
  const batchYIEP_A = await ensureBatch('Batch YIEP 2026 A', { course: 'YIEP', trainerId: trainer._id });
  const batchYIEP_B = await ensureBatch('Batch YIEP 2026 B', { course: 'YIEP', trainerId: trainerB._id });
  const batchYBLP_A = await ensureBatch('Batch YBLP 2026 A', { course: 'YBLP', trainerId: trainer._id });
  const batchYBLP_B = await ensureBatch('Batch YBLP 2026 B', { course: 'YBLP', trainerId: trainerB._id, status: 'upcoming' });

  // Assign trainees to batches
  await User.findByIdAndUpdate(trainee._id,  { $addToSet: { batchIds: batchDemo._id } });
  await User.findByIdAndUpdate(trainee2._id, { $addToSet: { batchIds: batchDemo._id } });
  await User.findByIdAndUpdate(trainee3._id, { $addToSet: { batchIds: batchYIEP_A._id } });

  console.log('   Batches ensured:', batchDemo.name, batchYIEP_A.name, batchYIEP_B.name, batchYBLP_A.name, batchYBLP_B.name);

  // ── 3. COURSES ───────────────────────────────────────────────────────────
  console.log('\n📚  Seeding courses...');
  const yiepCourse = await ensureCourse('YIEP', 'YIEP — Full Stack Development', { duration: 36, durationUnit: 'week', level: 'beginner' });
  const yblpCourse = await ensureCourse('YBLP', 'YBLP — Business Leadership Program', { duration: 24, durationUnit: 'week', level: 'intermediate' });
  console.log('   Courses ensured:', yiepCourse.code, yblpCourse.code);

  // ── 4. SESSIONS ──────────────────────────────────────────────────────────
  console.log('\n📅  Seeding sessions...');
  const session1 = await ensureSession('React Fundamentals — Session 1', {
    batchId: batchDemo._id,
    trainerId: trainer._id,
    trainees: [trainee._id, trainee2._id],
    status: 'completed',
    scheduledAt: new Date(Date.now() - 86400000 * 2),
    description: 'Introduction to React and components.',
  });

  const session2 = await ensureSession('Node.js Deep Dive', {
    batchId: batchDemo._id,
    trainerId: trainer._id,
    trainees: [trainee._id, trainee2._id],
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000),
    description: 'Advanced Node.js patterns.',
  });

  const session3 = await ensureSession('YIEP Orientation', {
    batchId: batchYIEP_A._id,
    trainerId: trainerB._id,
    trainees: [trainee3._id],
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000 * 2),
  });

  const session4 = await ensureSession('Leadership Workshop', {
    batchId: batchYBLP_A._id,
    trainerId: trainer._id,
    trainees: [trainee._id],
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000 * 3),
  });

  console.log('   Sessions ensured:', session1.title, session2.title, session3.title, session4.title);

  // ── 5. ATTENDANCE ────────────────────────────────────────────────────────
  console.log('\n📋  Seeding attendance...');
  const att1 = await Attendance.findOneAndUpdate(
    { session: session1._id, trainee: trainee._id },
    { session: session1._id, trainee: trainee._id, batch: session1.batchId, status: 'present', attendedSeconds: 3500, source: 'system' },
    { upsert: true, new: true }
  );
  const att2 = await Attendance.findOneAndUpdate(
    { session: session1._id, trainee: trainee2._id },
    { session: session1._id, trainee: trainee2._id, batch: session1.batchId, status: 'late', attendedSeconds: 2800, source: 'system' },
    { upsert: true, new: true }
  );
  const att3 = await Attendance.findOneAndUpdate(
    { session: session2._id, trainee: trainee._id },
    { session: session2._id, trainee: trainee._id, batch: session2.batchId, status: 'absent', source: 'system' },
    { upsert: true, new: true }
  );
  console.log('   Attendance records ensured:', att1._id, att2._id, att3._id);

  // ── 6. ASSIGNMENTS ───────────────────────────────────────────────────────
  console.log('\n📝  Seeding assignments...');
  const assignment1 = await Assignment.findOneAndUpdate(
    { title: 'React Component Assignment', batchId: batchDemo._id, createdBy: trainer._id },
    {
      title: 'React Component Assignment',
      description: 'Build a todo app with React.',
      instructions: 'Use hooks and context.',
      batchId: batchDemo._id,
      createdBy: trainer._id,
      dueDate: new Date(Date.now() + 86400000 * 5),
      maxScore: 100,
      status: 'active',
      submissions: [
        { trainee: trainee._id, submissionUrl: 'https://github.com/trainee/todo', notes: 'Done', submittedAt: new Date(), status: 'submitted' },
        { trainee: trainee2._id, submissionUrl: 'https://github.com/trainee2/todo', notes: 'Done', submittedAt: new Date(), status: 'submitted', grade: 85, feedback: 'Good work', gradedBy: trainer._id, gradedAt: new Date(), status: 'graded' },
      ],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('   Assignment ensured:', assignment1.title, '| _id:', assignment1._id);
  const assignmentCount = await Assignment.countDocuments({});
  console.log('   Current assignment count in DB:', assignmentCount);

  // ── 7. FEEDBACK ──────────────────────────────────────────────────────────
  console.log('\n💬  Seeding feedback...');
  const lmsFeedback1 = await LmsFeedback.findOneAndUpdate(
    { sessionId: session1._id, studentId: trainee._id },
    {
      sessionId: session1._id,
      studentId: trainee._id,
      trainerId: trainer._id,
      rating: 4,
      trainerRating: 4,
      contentRating: 5,
      audioRating: 4,
      videoRating: 3,
      comment: 'Great session, very informative.',
      suggestions: 'More examples please.',
    },
    { upsert: true, new: true }
  );
  console.log('   LMS feedback ensured:', lmsFeedback1._id);

  // ── 8. REGISTRATIONS ────────────────────────────────────────────────────
  console.log('\n📥  Seeding registrations...');
  const reg1 = await Registration.findOneAndUpdate(
    { email: 'lead1@younovate.in' },
    {
      fullName: 'Lead One',
      email: 'lead1@younovate.in',
      phone: '9999999991',
      programInterest: 'YIEP',
      source: 'web',
      status: 'registered',
    },
    { upsert: true, new: true }
  );
  const reg2 = await Registration.findOneAndUpdate(
    { email: 'lead2@younovate.in' },
    {
      fullName: 'Lead Two',
      email: 'lead2@younovate.in',
      phone: '9999999992',
      programInterest: 'YBLP',
      source: 'referral',
      status: 'lead',
    },
    { upsert: true, new: true }
  );
  console.log('   Registrations ensured:', reg1.email, reg2.email);

  // ── 9. WORKSHOPS ────────────────────────────────────────────────────────
  console.log('\n🎓  Seeding workshops...');
  const workshop1 = await ensureWorkshop('AI Bootcamp — Gemini', {
    trainerId: trainer._id,
    trainerName: trainer.name,
    description: 'Hands-on AI workshop.',
    mode: 'Online',
    duration: 120,
    feeType: 'Free',
    isFree: true,
  });

  const workshop2 = await ensureWorkshop('React Node Workshop', {
    trainerId: trainerB._id,
    trainerName: trainerB.name,
    description: 'Full-stack React + Node.js.',
    mode: 'Hybrid',
    duration: 90,
    feeType: 'Free',
    isFree: true,
  });

  // Workshop batches
  const wb1 = await ensureWorkshopBatch(workshop1._id, 'WB-AI-001', 'AI Batch 1', {
    trainerId: trainer._id,
    students: [trainee._id, trainee2._id],
    capacity: 50,
  });

  const wb2 = await ensureWorkshopBatch(workshop2._id, 'WB-RN-001', 'React Node Batch 1', {
    trainerId: trainerB._id,
    students: [trainee._id, trainee3._id],
    capacity: 40,
  });

  // Workshop registrations
  const wReg1 = await WorkshopRegistration.findOneAndUpdate(
    { workshopId: workshop1._id, studentId: trainee._id },
    { workshopId: workshop1._id, studentId: trainee._id, registrationStatus: 'Enrolled', paymentStatus: 'Free', paymentAmount: 0 },
    { upsert: true, new: true }
  );
  const wReg2 = await WorkshopRegistration.findOneAndUpdate(
    { workshopId: workshop2._id, studentId: trainee2._id },
    { workshopId: workshop2._id, studentId: trainee2._id, registrationStatus: 'Enrolled', paymentStatus: 'Free', paymentAmount: 0 },
    { upsert: true, new: true }
  );
  console.log('   Workshops ensured:', workshop1.title, workshop2.title);

  // Workshop sessions
  const ws1 = await Session.findOneAndUpdate(
    { title: 'AI Workshop — Day 1', sessionType: 'WORKSHOP', workshopBatchId: wb1._id },
    {
      title: 'AI Workshop — Day 1',
      sessionType: 'WORKSHOP',
      workshopBatchId: wb1._id,
      trainerId: trainer._id,
      trainees: [trainee._id, trainee2._id],
      status: 'completed',
      scheduledAt: new Date(Date.now() - 86400000),
      durationMinutes: 120,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const ws2 = await Session.findOneAndUpdate(
    { title: 'React Workshop — Session 1', sessionType: 'WORKSHOP', workshopBatchId: wb2._id },
    {
      title: 'React Workshop — Session 1',
      sessionType: 'WORKSHOP',
      workshopBatchId: wb2._id,
      trainerId: trainerB._id,
      trainees: [trainee._id, trainee3._id],
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 86400000),
      durationMinutes: 90,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Workshop attendance
  try {
    const existingWa1 = await WorkshopAttendance.findOne({ sessionId: ws1._id, studentId: trainee._id }).lean();
    if (!existingWa1) {
      await WorkshopAttendance.create({
        sessionId: ws1._id,
        workshopBatchId: wb1._id,
        workshopId: workshop1._id,
        studentId: trainee._id,
        attendanceStatus: 'Present',
        duration: 110,
        attendancePct: 92,
      });
    }
    const existingWa2 = await WorkshopAttendance.findOne({ sessionId: ws1._id, studentId: trainee2._id }).lean();
    if (!existingWa2) {
      await WorkshopAttendance.create({
        sessionId: ws1._id,
        workshopBatchId: wb1._id,
        workshopId: workshop1._id,
        studentId: trainee2._id,
        attendanceStatus: 'Present',
        duration: 105,
        attendancePct: 87,
      });
    }
    console.log('   Workshop attendance ensured');
  } catch (err) {
    console.error('   Workshop attendance error (continuing):', err.message);
  }
  console.log('   Workshop sessions ensured:', ws1.title, ws2.title);

  // Workshop feedback
  const wf1 = await WorkshopFeedback.findOneAndUpdate(
    { sessionId: ws1._id, studentId: trainee._id },
    {
      workshopId: workshop1._id,
      sessionId: ws1._id,
      studentId: trainee._id,
      trainerId: trainer._id,
      rating: 5,
      trainerRating: 5,
      contentRating: 5,
      audioRating: 4,
      videoRating: 4,
      comment: 'Excellent workshop!',
      suggestions: 'More hands-on exercises.',
    },
    { upsert: true, new: true }
  );
  console.log('   Workshop feedback ensured:', wf1._id);

  // Workshop certificates
  const wc1 = await WorkshopCertificate.findOneAndUpdate(
    { workshopId: workshop1._id, studentId: trainee._id },
    { workshopId: workshop1._id, studentId: trainee._id, certificateNo: 'CERT-AI-001', status: 'Issued', issuedDate: new Date() },
    { upsert: true, new: true }
  );
  console.log('   Workshop certificate ensured:', wc1._id);

  // ── 10. COURSE SUBSCRIPTIONS ─────────────────────────────────────────────
  console.log('\n🔑  Seeding course subscriptions...');
  const CourseSubscription = require('../models/CourseSubscription');
  const sub1 = await CourseSubscription.findOneAndUpdate(
    { trainee: trainee._id, course: yiepCourse._id },
    { trainee: trainee._id, course: yiepCourse._id, plan: 'admin', status: 'active', startDate: new Date(), endDate: null },
    { upsert: true, new: true }
  );
  const sub2 = await CourseSubscription.findOneAndUpdate(
    { trainee: trainee2._id, course: yiepCourse._id },
    { trainee: trainee2._id, course: yiepCourse._id, plan: 'admin', status: 'active', startDate: new Date(), endDate: null },
    { upsert: true, new: true }
  );
  console.log('   Subscriptions ensured:', sub1._id, sub2._id);
  const subCount = await CourseSubscription.countDocuments({});
  console.log('   Current subscription count in DB:', subCount);

  console.log('\n🌱  Seed complete\n');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
