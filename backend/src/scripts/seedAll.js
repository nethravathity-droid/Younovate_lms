'use strict';
/**
 * COMPLETE SEED SCRIPT — Younovate LMS
 * ─────────────────────────────────────
 * Seeds ALL data from scratch:
 *   ✅ Admin, Trainers, Trainees, HR users
 *   ✅ LMS Batches
 *   ✅ Workshops (Published + open for registration)
 *   ✅ Workshop Registrations (Approved)
 *   ✅ Workshop Batches (with students[] populated)
 *   ✅ Workshop Sessions (scheduled)
 *   ✅ LMS Sessions
 *
 * Usage:
 *   node src/scripts/seedAll.js
 *   node src/scripts/seedAll.js --fresh   ← wipes ALL collections first
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/younovate_lms';
const FRESH  = process.argv.includes('--fresh');

// ── Models ────────────────────────────────────────────────────────────────────
const User         = require('../models/User');
const Batch        = require('../models/Batch');
const Session      = require('../models/Session');
const Workshop     = require('../models/Workshop');
const WorkshopBatch = require('../models/WorkshopBatch');
const { WorkshopPublicRegistration } = require('../models/WorkshopModels');

// ── Helpers ───────────────────────────────────────────────────────────────────
const ok   = (msg) => console.log(`  ✅  ${msg}`);
const info = (msg) => console.log(`  ℹ️   ${msg}`);
const warn = (msg) => console.log(`  ⚠️   ${msg}`);
const head = (msg) => console.log(`\n${'═'.repeat(55)}\n  ${msg}\n${'═'.repeat(55)}`);

async function hashPw(plain) {
  return bcrypt.hash(plain, 12);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  await mongoose.connect(MONGO);
  ok(`Connected → ${MONGO}`);

  // ── Optional: wipe everything ──────────────────────────────────────────────
  if (FRESH) {
    head('--fresh: Wiping all collections');
    await Promise.all([
      User.deleteMany({}),
      Batch.deleteMany({}),
      Session.deleteMany({}),
      Workshop.deleteMany({}),
      WorkshopBatch.deleteMany({}),
      WorkshopPublicRegistration.deleteMany({}),
    ]);
    ok('All collections wiped');
  } else {
    // Safe mode: only remove the known seed accounts so we can re-create them
    head('Safe mode: removing existing seed accounts only');
    const seedEmails = [
      'admin@younovate.in',
      'trainer@younovate.in',
      'trainerb@younovate.in',
      'trainee@younovate.in',
      'trainee2@younovate.in',
      'trainee3@younovate.in',
      'hr@younovate.in',
    ];
    const del = await User.deleteMany({ email: { $in: seedEmails } });
    ok(`Removed ${del.deletedCount} existing seed accounts`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. USERS
  // ══════════════════════════════════════════════════════════════════════════
  head('1. Creating Users');

  // Use plain-text passwords — the User pre-save hook will bcrypt.hash them
  const admin = new User({
    name: 'Admin Demo', email: 'admin@younovate.in',
    password: 'Admin@1234', role: 'admin', isActive: true,
  });
  await admin.save();
  ok(`admin     → admin@younovate.in  /  Admin@1234`);

  const trainer = new User({
    name: 'Trainer Demo', email: 'trainer@younovate.in',
    password: 'Trainer@1234', role: 'trainer', isActive: true,
    bio: 'Senior Full Stack Developer with 8 years experience.',
    expertise: ['React', 'Node.js', 'MongoDB', 'AWS'],
  });
  await trainer.save();
  ok(`trainer   → trainer@younovate.in  /  Trainer@1234`);

  const trainerB = new User({
    name: 'Trainer B Demo', email: 'trainerb@younovate.in',
    password: 'TrainerB@1234', role: 'trainer', isActive: true,
    bio: 'AI/ML Engineer and Data Science instructor.',
    expertise: ['Python', 'TensorFlow', 'Data Science', 'AI'],
  });
  await trainerB.save();
  ok(`trainerB  → trainerb@younovate.in  /  TrainerB@1234`);

  const hr = new User({
    name: 'HR Demo', email: 'hr@younovate.in',
    password: 'Hr@12345678', role: 'hr', isActive: true,
  });
  await hr.save();
  ok(`hr        → hr@younovate.in  /  Hr@12345678`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. LMS BATCHES
  // ══════════════════════════════════════════════════════════════════════════
  head('2. Creating LMS Batches');

  const batchA = await Batch.findOneAndUpdate(
    { name: 'Full Stack Batch 2026' },
    {
      name: 'Full Stack Batch 2026',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: 'active',
      course: 'Full Stack Development',
      trainerId: trainer._id,
      maxStudents: 30,
    },
    { upsert: true, new: true }
  );
  ok(`Batch A: "${batchA.name}" (${batchA._id})`);

  const batchB = await Batch.findOneAndUpdate(
    { name: 'AI/ML Batch 2026' },
    {
      name: 'AI/ML Batch 2026',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-09-30'),
      status: 'active',
      course: 'Artificial Intelligence & Machine Learning',
      trainerId: trainerB._id,
      maxStudents: 25,
    },
    { upsert: true, new: true }
  );
  ok(`Batch B: "${batchB.name}" (${batchB._id})`);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. LMS TRAINEES (linked to batches)
  // ══════════════════════════════════════════════════════════════════════════
  head('3. Creating LMS Trainees');

  const trainee = new User({
    name: 'Trainee Demo', email: 'trainee@younovate.in',
    password: 'Trainee@1234', role: 'trainee', isActive: true,
    batchIds: [batchA._id], enrolledAt: new Date(),
    skills: ['JavaScript', 'React'],
    placementStatus: 'training',
  });
  await trainee.save();
  ok(`trainee   → trainee@younovate.in  /  Trainee@1234  (Batch: ${batchA.name})`);

  const trainee2 = new User({
    name: 'Trainee Two', email: 'trainee2@younovate.in',
    password: 'Trainee2@1234', role: 'trainee', isActive: true,
    batchIds: [batchA._id, batchB._id], enrolledAt: new Date(),
    skills: ['Python', 'Node.js'],
    placementStatus: 'enrolled',
  });
  await trainee2.save();
  ok(`trainee2  → trainee2@younovate.in  /  Trainee2@1234  (Batches: A + B)`);

  const trainee3 = new User({
    name: 'Trainee Three', email: 'trainee3@younovate.in',
    password: 'Trainee3@1234', role: 'trainee', isActive: true,
    batchIds: [batchB._id], enrolledAt: new Date(),
    skills: ['Python', 'TensorFlow'],
    placementStatus: 'enrolled',
  });
  await trainee3.save();
  ok(`trainee3  → trainee3@younovate.in  /  Trainee3@1234  (Batch: ${batchB.name})`);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. LMS SESSIONS
  // ══════════════════════════════════════════════════════════════════════════
  head('4. Creating LMS Sessions');

  const now = new Date();

  const lmsSession1 = await Session.create({
    sessionType: 'LMS',
    title: 'React Hooks Deep Dive',
    description: 'Understanding useState, useEffect, useContext and custom hooks.',
    batchId: batchA._id,
    trainerId: trainer._id,
    trainees: [trainee._id, trainee2._id],
    scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    durationMinutes: 90,
    status: 'scheduled',
    joinBeforeMinutes: 10,
  });
  ok(`LMS Session 1: "${lmsSession1.title}" (${lmsSession1._id})`);

  const lmsSession2 = await Session.create({
    sessionType: 'LMS',
    title: 'Node.js REST API Design',
    description: 'Building scalable REST APIs with Express and MongoDB.',
    batchId: batchA._id,
    trainerId: trainer._id,
    trainees: [trainee._id, trainee2._id],
    scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    durationMinutes: 120,
    status: 'scheduled',
    joinBeforeMinutes: 10,
  });
  ok(`LMS Session 2: "${lmsSession2.title}" (${lmsSession2._id})`);

  const lmsSession3 = await Session.create({
    sessionType: 'LMS',
    title: 'Python for Data Science',
    description: 'NumPy, Pandas, Matplotlib and data wrangling techniques.',
    batchId: batchB._id,
    trainerId: trainerB._id,
    trainees: [trainee2._id, trainee3._id],
    scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    durationMinutes: 90,
    status: 'scheduled',
    joinBeforeMinutes: 10,
  });
  ok(`LMS Session 3: "${lmsSession3.title}" (${lmsSession3._id})`);

  // ══════════════════════════════════════════════════════════════════════════
  // 5. WORKSHOPS
  // ══════════════════════════════════════════════════════════════════════════
  head('5. Creating Workshops');

  const workshop1 = await Workshop.create({
    title: 'AI Workshop for Interns',
    description: 'Hands-on AI/ML workshop covering fundamentals to deployment. Learn Python, TensorFlow, and build real AI projects.',
    subtitle: 'From Zero to AI Hero in 3 Days',
    category: 'Artificial Intelligence',
    trainerId: trainerB._id,
    trainerName: trainerB.name,
    createdBy: admin._id,
    mode: 'Online',
    date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    time: '10:00 AM',
    duration: 180,
    feeType: 'Free',
    isFree: true,
    fee: 0,
    maxSeats: 50,
    availableSeats: 50,
    registrationCount: 0,
    status: 'Published',
    published: true,
    registrationOpen: true,
    language: 'English',
    learningOutcomes: 'Build AI models, understand ML pipelines, deploy models to production.',
    prerequisites: 'Basic Python knowledge helpful but not required.',
  });
  ok(`Workshop 1: "${workshop1.title}" (${workshop1._id})`);

  const workshop2 = await Workshop.create({
    title: 'Full Stack Web Development Bootcamp',
    description: 'Complete full stack development workshop covering React, Node.js, MongoDB and deployment.',
    subtitle: 'Build Production-Ready Web Apps',
    category: 'Web Development',
    trainerId: trainer._id,
    trainerName: trainer.name,
    createdBy: admin._id,
    mode: 'Online',
    date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
    time: '11:00 AM',
    duration: 240,
    feeType: 'Free',
    isFree: true,
    fee: 0,
    maxSeats: 40,
    availableSeats: 40,
    registrationCount: 0,
    status: 'Published',
    published: true,
    registrationOpen: true,
    language: 'English',
    learningOutcomes: 'Build full stack apps with React + Node.js + MongoDB.',
    prerequisites: 'Basic HTML/CSS/JavaScript knowledge.',
  });
  ok(`Workshop 2: "${workshop2.title}" (${workshop2._id})`);

  // ══════════════════════════════════════════════════════════════════════════
  // 6. WORKSHOP REGISTRATIONS (Approved — with userId set)
  // ══════════════════════════════════════════════════════════════════════════
  head('6. Creating Workshop Registrations (Approved)');

  // Workshop 1 registrations
  const wsReg1 = await WorkshopPublicRegistration.create({
    workshopId: workshop1._id,
    workshopName: workshop1.title,
    fullName: trainee.name,
    email: trainee.email,
    phone: '9876543210',
    whatsapp: '9876543210',
    city: 'Bangalore',
    state: 'Karnataka',
    registrationStatus: 'Approved',
    userId: trainee._id,
    registrationDate: new Date(),
  });
  ok(`WS Reg 1: ${trainee.email} → Workshop 1 (Approved, userId: ${trainee._id})`);

  const wsReg2 = await WorkshopPublicRegistration.create({
    workshopId: workshop1._id,
    workshopName: workshop1.title,
    fullName: trainee2.name,
    email: trainee2.email,
    phone: '9876543211',
    whatsapp: '9876543211',
    city: 'Mumbai',
    state: 'Maharashtra',
    registrationStatus: 'Approved',
    userId: trainee2._id,
    registrationDate: new Date(),
  });
  ok(`WS Reg 2: ${trainee2.email} → Workshop 1 (Approved, userId: ${trainee2._id})`);

  const wsReg3 = await WorkshopPublicRegistration.create({
    workshopId: workshop1._id,
    workshopName: workshop1.title,
    fullName: trainee3.name,
    email: trainee3.email,
    phone: '9876543212',
    whatsapp: '9876543212',
    city: 'Hyderabad',
    state: 'Telangana',
    registrationStatus: 'Approved',
    userId: trainee3._id,
    registrationDate: new Date(),
  });
  ok(`WS Reg 3: ${trainee3.email} → Workshop 1 (Approved, userId: ${trainee3._id})`);

  // Workshop 2 registrations
  const wsReg4 = await WorkshopPublicRegistration.create({
    workshopId: workshop2._id,
    workshopName: workshop2.title,
    fullName: trainee.name,
    email: trainee.email,
    phone: '9876543210',
    whatsapp: '9876543210',
    city: 'Bangalore',
    state: 'Karnataka',
    registrationStatus: 'Approved',
    userId: trainee._id,
    registrationDate: new Date(),
  });
  ok(`WS Reg 4: ${trainee.email} → Workshop 2 (Approved, userId: ${trainee._id})`);

  const wsReg5 = await WorkshopPublicRegistration.create({
    workshopId: workshop2._id,
    workshopName: workshop2.title,
    fullName: trainee2.name,
    email: trainee2.email,
    phone: '9876543211',
    whatsapp: '9876543211',
    city: 'Mumbai',
    state: 'Maharashtra',
    registrationStatus: 'Approved',
    userId: trainee2._id,
    registrationDate: new Date(),
  });
  ok(`WS Reg 5: ${trainee2.email} → Workshop 2 (Approved, userId: ${trainee2._id})`);

  // Update workshop seat counts
  await Workshop.findByIdAndUpdate(workshop1._id, { registrationCount: 3, availableSeats: 47 });
  await Workshop.findByIdAndUpdate(workshop2._id, { registrationCount: 2, availableSeats: 38 });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. WORKSHOP BATCHES (students[] auto-populated from registrations)
  // ══════════════════════════════════════════════════════════════════════════
  head('7. Creating Workshop Batches');

  const wsBatch1 = await WorkshopBatch.create({
    workshopId: workshop1._id,
    batchName: 'AI Workshop Batch A',
    batchCode: 'AI-WS-2026-A',
    registrationIds: [wsReg1._id, wsReg2._id, wsReg3._id],
    students: [trainee._id, trainee2._id, trainee3._id], // ← populated from registrations
    trainerId: trainerB._id,
    trainer: trainerB.name,
    assignedBy: admin._id,
    assignedAt: new Date(),
    startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    startTime: '10:00',
    endTime: '13:00',
    mode: 'Online',
    capacity: 50,
    status: 'Scheduled',
    createdBy: admin._id,
  });
  ok(`WS Batch 1: "${wsBatch1.batchName}" (${wsBatch1._id}) — students: [${wsBatch1.students.join(', ')}]`);

  const wsBatch2 = await WorkshopBatch.create({
    workshopId: workshop2._id,
    batchName: 'Full Stack Batch A',
    batchCode: 'FS-WS-2026-A',
    registrationIds: [wsReg4._id, wsReg5._id],
    students: [trainee._id, trainee2._id], // ← populated from registrations
    trainerId: trainer._id,
    trainer: trainer.name,
    assignedBy: admin._id,
    assignedAt: new Date(),
    startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
    startTime: '11:00',
    endTime: '15:00',
    mode: 'Online',
    capacity: 40,
    status: 'Scheduled',
    createdBy: admin._id,
  });
  ok(`WS Batch 2: "${wsBatch2.batchName}" (${wsBatch2._id}) — students: [${wsBatch2.students.join(', ')}]`);

  // ══════════════════════════════════════════════════════════════════════════
  // 8. WORKSHOP SESSIONS
  // ══════════════════════════════════════════════════════════════════════════
  head('8. Creating Workshop Sessions');

  const wsSession1 = await Session.create({
    sessionType: 'WORKSHOP',
    workshopBatchId: wsBatch1._id,
    title: 'AI Workshop — Day 1: Python & ML Fundamentals',
    description: 'Introduction to Python for AI, NumPy, Pandas, and basic ML concepts.',
    trainerId: trainerB._id,
    scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    durationMinutes: 180,
    status: 'scheduled',
    joinBeforeMinutes: 15,
  });
  ok(`WS Session 1: "${wsSession1.title}" (${wsSession1._id})`);

  const wsSession2 = await Session.create({
    sessionType: 'WORKSHOP',
    workshopBatchId: wsBatch1._id,
    title: 'AI Workshop — Day 2: Deep Learning & Neural Networks',
    description: 'TensorFlow, Keras, building and training neural networks.',
    trainerId: trainerB._id,
    scheduledAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
    durationMinutes: 180,
    status: 'scheduled',
    joinBeforeMinutes: 15,
  });
  ok(`WS Session 2: "${wsSession2.title}" (${wsSession2._id})`);

  const wsSession3 = await Session.create({
    sessionType: 'WORKSHOP',
    workshopBatchId: wsBatch1._id,
    title: 'AI Workshop — Day 3: Model Deployment & Projects',
    description: 'Deploy AI models to production, build capstone project.',
    trainerId: trainerB._id,
    scheduledAt: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
    durationMinutes: 180,
    status: 'scheduled',
    joinBeforeMinutes: 15,
  });
  ok(`WS Session 3: "${wsSession3.title}" (${wsSession3._id})`);

  const wsSession4 = await Session.create({
    sessionType: 'WORKSHOP',
    workshopBatchId: wsBatch2._id,
    title: 'Full Stack — Day 1: React & Frontend Architecture',
    description: 'React components, hooks, state management with Redux.',
    trainerId: trainer._id,
    scheduledAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    durationMinutes: 240,
    status: 'scheduled',
    joinBeforeMinutes: 15,
  });
  ok(`WS Session 4: "${wsSession4.title}" (${wsSession4._id})`);

  const wsSession5 = await Session.create({
    sessionType: 'WORKSHOP',
    workshopBatchId: wsBatch2._id,
    title: 'Full Stack — Day 2: Node.js, Express & MongoDB',
    description: 'Backend APIs, authentication, database design.',
    trainerId: trainer._id,
    scheduledAt: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
    durationMinutes: 240,
    status: 'scheduled',
    joinBeforeMinutes: 15,
  });
  ok(`WS Session 5: "${wsSession5.title}" (${wsSession5._id})`);

  // ══════════════════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  head('SEED COMPLETE — Login Credentials');

  console.log(`
  ┌──────────────────────────────────────────────────────────────┐
  │  ROLE      EMAIL                     PASSWORD                │
  ├──────────────────────────────────────────────────────────────┤
  │  admin     admin@younovate.in        Admin@1234              │
  │  trainer   trainer@younovate.in      Trainer@1234            │
  │  trainer   trainerb@younovate.in     TrainerB@1234           │
  │  trainee   trainee@younovate.in      Trainee@1234            │
  │  trainee   trainee2@younovate.in     Trainee2@1234           │
  │  trainee   trainee3@younovate.in     Trainee3@1234           │
  │  hr        hr@younovate.in           Hr@12345678             │
  └──────────────────────────────────────────────────────────────┘

  WHAT WAS SEEDED:
  ─────────────────────────────────────────────────────────────
  Users              : 7  (1 admin, 2 trainers, 3 trainees, 1 hr)
  LMS Batches        : 2  (Full Stack + AI/ML)
  LMS Sessions       : 3  (scheduled, upcoming)
  Workshops          : 2  (Published, registration open)
  WS Registrations   : 5  (all Approved, userId linked)
  Workshop Batches   : 2  (students[] populated automatically)
  Workshop Sessions  : 5  (3 for AI workshop, 2 for Full Stack)
  ─────────────────────────────────────────────────────────────

  TRAINEE SESSION VISIBILITY:
  trainee@younovate.in  → AI Workshop (3 sessions) + Full Stack (2 sessions)
  trainee2@younovate.in → AI Workshop (3 sessions) + Full Stack (2 sessions)
  trainee3@younovate.in → AI Workshop (3 sessions)
  ─────────────────────────────────────────────────────────────
  `);

  await mongoose.disconnect();
  console.log('  🌱  Done.\n');
  process.exit(0);
})().catch(err => {
  console.error('\n❌  Seed failed:', err.message);
  if (err.code === 11000) {
    console.error('   Duplicate key — run with --fresh to wipe and re-seed:');
    console.error('   node src/scripts/seedAll.js --fresh');
  }
  process.exit(1);
});
