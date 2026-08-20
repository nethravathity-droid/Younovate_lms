'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const Workshop = require('../models/Workshop');
const User     = require('../models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'younovate_lms' });
  console.log('✅  Connected to MongoDB');

  const admin   = await User.findOne({ email: 'admin@younovate.in' }).lean();
  const trainer = await User.findOne({ email: 'trainer@younovate.in' }).lean();

  if (!admin || !trainer) {
    console.error('❌  Run resetDemoAccounts.js first — admin/trainer not found');
    process.exit(1);
  }

  const existing = await Workshop.countDocuments();
  if (existing > 0) {
    console.log(`ℹ️   ${existing} workshops already exist — skipping seed (use --force to reseed)`);
    if (!process.argv.includes('--force')) {
      await mongoose.disconnect();
      process.exit(0);
    }
    console.log('⚠️   --force flag detected — reseeding workshops only (users/batches untouched)');
    await Workshop.deleteMany({});
  }

  const now = new Date();
  const d = (offsetDays) => new Date(now.getTime() + offsetDays * 86400000);

  const workshops = [
    {
      title: 'Full Stack Web Development Bootcamp',
      subtitle: 'Build real-world apps with React & Node.js',
      description: 'A hands-on bootcamp covering React, Node.js, Express, and MongoDB. Build 3 full-stack projects.',
      category: 'Technology',
      mode: 'Online',
      date: d(7),
      startDate: d(7),
      endDate: d(7),
      time: '10:00',
      duration: 180,
      feeType: 'Paid',
      isFree: false,
      fee: 999,
      maxSeats: 50,
      availableSeats: 50,
      status: 'Published',
      published: true,
      registrationOpen: true,
      language: 'English',
      trainerId: trainer._id,
      trainerName: trainer.name,
      createdBy: admin._id,
      learningOutcomes: 'Build full-stack apps, REST APIs, React components, MongoDB schemas',
      prerequisites: 'Basic HTML/CSS knowledge',
      waitingList: true,
      certificateEnabled: true,
      attendanceRequired: true,
    },
    {
      title: 'Python for Data Science',
      subtitle: 'From zero to data analyst in one day',
      description: 'Learn Python, Pandas, NumPy, and Matplotlib. Analyse real datasets and build visualisations.',
      category: 'Data Science',
      mode: 'Online',
      date: d(14),
      startDate: d(14),
      endDate: d(14),
      time: '09:00',
      duration: 240,
      feeType: 'Free',
      isFree: true,
      fee: 0,
      maxSeats: 100,
      availableSeats: 100,
      status: 'Published',
      published: true,
      registrationOpen: true,
      language: 'English',
      trainerId: trainer._id,
      trainerName: trainer.name,
      createdBy: admin._id,
      learningOutcomes: 'Python basics, data manipulation with Pandas, data visualisation',
      prerequisites: 'No prior programming experience needed',
      waitingList: false,
      certificateEnabled: true,
      attendanceRequired: true,
    },
    {
      title: 'UI/UX Design Fundamentals',
      subtitle: 'Design beautiful interfaces with Figma',
      description: 'Learn design thinking, wireframing, prototyping, and user testing using Figma.',
      category: 'Design',
      mode: 'Offline',
      date: d(21),
      startDate: d(21),
      endDate: d(21),
      time: '11:00',
      duration: 150,
      feeType: 'Paid',
      isFree: false,
      fee: 499,
      maxSeats: 30,
      availableSeats: 30,
      status: 'Published',
      published: true,
      registrationOpen: true,
      language: 'English',
      trainerId: trainer._id,
      trainerName: trainer.name,
      createdBy: admin._id,
      learningOutcomes: 'Design principles, Figma prototyping, user research basics',
      prerequisites: 'None',
      waitingList: true,
      certificateEnabled: true,
      attendanceRequired: false,
    },
    {
      title: 'Digital Marketing Masterclass',
      subtitle: 'SEO, Social Media & Paid Ads',
      description: 'Complete digital marketing workshop covering SEO, Google Ads, Meta Ads, and content strategy.',
      category: 'Marketing',
      mode: 'Online',
      date: d(3),
      startDate: d(3),
      endDate: d(3),
      time: '14:00',
      duration: 120,
      feeType: 'Free',
      isFree: true,
      fee: 0,
      maxSeats: 200,
      availableSeats: 200,
      status: 'Published',
      published: true,
      registrationOpen: true,
      language: 'Hindi',
      trainerId: trainer._id,
      trainerName: trainer.name,
      createdBy: admin._id,
      learningOutcomes: 'SEO basics, Google Ads setup, Meta Ads, content calendar',
      prerequisites: 'Basic internet knowledge',
      waitingList: false,
      certificateEnabled: false,
      attendanceRequired: true,
    },
    {
      title: 'Cloud Computing with AWS',
      subtitle: 'EC2, S3, Lambda and more',
      description: 'Hands-on AWS workshop. Deploy apps on EC2, store files on S3, and build serverless functions.',
      category: 'Cloud',
      mode: 'Online',
      date: d(30),
      startDate: d(30),
      endDate: d(30),
      time: '10:00',
      duration: 180,
      feeType: 'Paid',
      isFree: false,
      fee: 1499,
      maxSeats: 40,
      availableSeats: 40,
      status: 'Draft',
      published: false,
      registrationOpen: false,
      language: 'English',
      trainerId: trainer._id,
      trainerName: trainer.name,
      createdBy: admin._id,
      learningOutcomes: 'EC2 setup, S3 buckets, Lambda functions, IAM basics',
      prerequisites: 'Basic Linux command line',
      waitingList: false,
      certificateEnabled: true,
      attendanceRequired: true,
    },
    {
      title: 'Interview Preparation Workshop',
      subtitle: 'Crack your next tech interview',
      description: 'Mock interviews, DSA revision, system design basics, and HR round tips.',
      category: 'Career',
      mode: 'Online',
      date: d(-5),
      startDate: d(-5),
      endDate: d(-5),
      time: '09:00',
      duration: 120,
      feeType: 'Free',
      isFree: true,
      fee: 0,
      maxSeats: 75,
      availableSeats: 0,
      registrationCount: 75,
      status: 'Completed',
      published: true,
      registrationOpen: false,
      language: 'English',
      trainerId: trainer._id,
      trainerName: trainer.name,
      createdBy: admin._id,
      learningOutcomes: 'DSA patterns, system design, mock interview practice',
      prerequisites: 'Basic programming knowledge',
      waitingList: false,
      certificateEnabled: true,
      attendanceRequired: true,
    },
  ];

  const created = await Workshop.insertMany(workshops);
  console.log(`\n✅  Created ${created.length} workshops:\n`);
  created.forEach(w => {
    console.log(`  [${w.status.padEnd(10)}]  ${w.title}  (seats: ${w.maxSeats})`);
  });

  console.log('\n🌱  Workshop seed complete');
  await mongoose.disconnect();
  process.exit(0);
})().catch(err => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
