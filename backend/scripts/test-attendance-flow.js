require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

require('../src/models/User');
require('../src/models/Session');
require('../src/models/Attendance');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User');
    const Session = mongoose.model('Session');
    const Attendance = mongoose.model('Attendance');

    // Find a trainer and trainee
    const trainer = await User.findOne({ role: 'trainer' });
    const trainee = await User.findOne({ role: 'trainee' });
    if (!trainer || !trainee) {
      console.log('Missing trainer or trainee');
      await mongoose.disconnect();
      return;
    }

    // Create a test session scheduled for now
    const session = await Session.create({
      title: 'Attendance Test Session ' + new Date().toISOString(),
      scheduledAt: new Date(Date.now() - 60000), // started 1 min ago
      durationMinutes: 60,
      trainerId: trainer._id,
      sessionType: 'LMS',
      status: 'scheduled',
      batchId: null,
      trainees: [trainee._id],
    });

    console.log('Created session:', session._id.toString(), session.title);
    console.log('Scheduled at:', session.scheduledAt);
    console.log('Duration:', session.durationMinutes, 'min');

    // Start the session
    const trainerToken = jwt.sign(
      { userId: trainer._id.toString(), role: 'trainer', name: trainer.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const startRes = await axios.post(
      `http://localhost:8080/api/sessions/${session._id}/start`,
      {},
      { headers: { Authorization: `Bearer ${trainerToken}` } }
    );
    console.log('\nStart session:', startRes.status, startRes.data?.success ? 'SUCCESS' : 'FAILED');

    // Trainee joins
    const traineeToken = jwt.sign(
      { userId: trainee._id.toString(), role: 'trainee', name: trainee.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const joinRes = await axios.post(
      `http://localhost:8080/api/sessions/${session._id}/join`,
      {},
      { headers: { Authorization: `Bearer ${traineeToken}` } }
    );
    console.log('Trainee join:', joinRes.status, joinRes.data?.success ? 'SUCCESS' : 'FAILED');

    // Check attendance after join
    let att = await Attendance.findOne({ session: session._id, trainee: trainee._id }).lean();
    console.log('\nAttendance after join:');
    console.log('  status:', att?.status);
    console.log('  joinedAt:', att?.joinedAt);
    console.log('  leftAt:', att?.leftAt);
    console.log('  attendedSeconds:', att?.attendedSeconds);

    // Wait a bit (simulate trainee staying in session)
    await new Promise(r => setTimeout(r, 2000));

    // End the session
    const endRes = await axios.post(
      `http://localhost:8080/api/sessions/${session._id}/end`,
      {},
      { headers: { Authorization: `Bearer ${trainerToken}` } }
    );
    console.log('\nEnd session:', endRes.status, endRes.data?.success ? 'SUCCESS' : 'FAILED');

    // Check attendance after end
    att = await Attendance.findOne({ session: session._id, trainee: trainee._id }).lean();
    console.log('\nAttendance after end:');
    console.log('  status:', att?.status);
    console.log('  joinedAt:', att?.joinedAt);
    console.log('  leftAt:', att?.leftAt);
    console.log('  attendedSeconds:', att?.attendedSeconds);

    // Cleanup
    await Session.findByIdAndDelete(session._id);
    await Attendance.deleteMany({ session: session._id });
    await mongoose.disconnect();
    console.log('\nCleaned up test data');
  } catch (err) {
    console.error('Test error:', err.response?.data || err.message);
    try { await mongoose.disconnect(); } catch (_) {}
  }
}

test();
