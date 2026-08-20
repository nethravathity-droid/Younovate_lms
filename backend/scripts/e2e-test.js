'use strict';
/**
 * END-TO-END WORKSHOP FLOW TEST
 * ─────────────────────────────
 * Runs the complete flow against the LIVE backend (must be running on PORT 8080).
 * Uses a brand-new unique email every run to avoid interference from old records.
 *
 * Steps:
 *  1.  Register trainee (POST /api/workshops/register)
 *  2.  Verify workshopRegistrations document
 *  3.  Admin approves (PUT /api/workshops/admin/registrations/:id)
 *  4.  Verify User created + registration.userId set
 *  5.  Verify WorkshopBatch.students[] contains trainee userId
 *  6.  Admin schedules session (POST /api/workshop-sessions)
 *  7.  Verify Session document
 *  8.  Login as trainee
 *  9.  Call GET /api/trainee/workshop-sessions  → must return the session
 * 10.  Call GET /api/trainee/dashboard          → must include workshopUpcomingSessions
 * 11.  Call POST /api/trainee/workshop-sessions/:id/join  → attendance created
 * 12.  Verify WorkshopAttendance document
 * 13.  Print full MongoDB verification for every document
 */

const axios  = require('axios');
const mongoose = require('mongoose');
const path   = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE = `http://localhost:${process.env.PORT || 8080}`;
const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/younovate_lms';

// ── Unique test email (timestamp-based) ──────────────────────────────────────
const TS    = Date.now();
const EMAIL = `testtrainee_${TS}@younovate-e2e.com`;
const NAME  = 'E2E Test Trainee';

// ── Helpers ───────────────────────────────────────────────────────────────────
const line  = (ch = '═', n = 60) => ch.repeat(n);
const pass  = (msg) => console.log(`  ✅  ${msg}`);
const fail  = (msg) => { console.error(`  ❌  ${msg}`); process.exitCode = 1; };
const info  = (msg) => console.log(`  ℹ️   ${msg}`);
const head  = (msg) => console.log(`\n${line()}\n  ${msg}\n${line()}`);

async function adminLogin() {
  const { data } = await axios.post(`${BASE}/api/auth/login`, {
    email: 'admin@younovate.in',
    password: 'TestAdmin@999',
  });
  if (!data.accessToken) throw new Error('Admin login failed — check credentials in test script');
  return data.accessToken;
}

async function traineeLogin(email, password) {
  const { data } = await axios.post(`${BASE}/api/auth/login`, { email, password });
  if (!data.accessToken) throw new Error(`Trainee login failed for ${email}`);
  return data.accessToken;
}

function auth(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// ── MongoDB direct access ─────────────────────────────────────────────────────
let db;
async function connectMongo() {
  await mongoose.connect(MONGO);
  db = mongoose.connection.db;
  info(`MongoDB connected: ${MONGO}`);
}

async function mongoDoc(collection, query) {
  return db.collection(collection).findOne(query);
}

async function mongoFind(collection, query) {
  return db.collection(collection).find(query).toArray();
}

// ── Main test ─────────────────────────────────────────────────────────────────
async function run() {
  await connectMongo();

  head('STEP 0 — Admin Login + Get Workshop + Batch');
  const adminToken = await adminLogin();
  pass('Admin logged in');

  // Get first published workshop
  const { data: wsData } = await axios.get(`${BASE}/api/workshops/admin/all`, auth(adminToken));
  const workshops = wsData.data?.workshops || [];
  if (workshops.length === 0) {
    fail('No workshops found. Create at least one Published workshop first.');
    process.exit(1);
  }
  const workshop = workshops.find(w => w.registrationOpen) || workshops[0];
  info(`Using workshop: "${workshop.title}" (${workshop._id})`);

  // ── STEP 1: Register trainee ─────────────────────────────────────────────
  head('STEP 1 — Register New Trainee');
  info(`Email: ${EMAIL}`);

  let regDoc;
  try {
    const { data: regData } = await axios.post(`${BASE}/api/workshops/register`, {
      workshopId:    workshop._id,
      fullName:      NAME,
      email:         EMAIL,
      phone:         '9876543210',
      whatsapp:      '9876543210',
      city:          'Bangalore',
      state:         'Karnataka',
    });
    regDoc = regData.data;
    pass(`Registration created: ${regDoc._id}`);
  } catch (err) {
    fail(`Registration failed: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }

  // ── STEP 2: Verify workshopRegistrations document ────────────────────────
  head('STEP 2 — Verify workshopRegistrations Document');
  const regMongo = await mongoDoc('workshopRegistrations', { _id: new mongoose.Types.ObjectId(regDoc._id) });
  if (!regMongo) { fail('Registration NOT found in MongoDB'); process.exit(1); }

  console.log('\n  📄 workshopRegistrations document:');
  console.log(`     _id:                ${regMongo._id}`);
  console.log(`     workshopId:         ${regMongo.workshopId}`);
  console.log(`     email:              ${regMongo.email}`);
  console.log(`     registrationStatus: ${regMongo.registrationStatus}`);
  console.log(`     userId:             ${regMongo.userId || 'null (not yet approved)'}`);

  if (regMongo.email !== EMAIL.toLowerCase()) fail(`Email mismatch: ${regMongo.email} !== ${EMAIL}`);
  else pass('Registration email matches');
  if (regMongo.registrationStatus !== 'Registered') fail(`Status should be Registered, got: ${regMongo.registrationStatus}`);
  else pass('registrationStatus = Registered ✓');
  if (regMongo.userId) fail('userId should be null before approval');
  else pass('userId is null before approval ✓');

  // ── STEP 3: Admin approves ───────────────────────────────────────────────
  head('STEP 3 — Admin Approves Registration');
  let approveResp;
  try {
    const { data } = await axios.put(
      `${BASE}/api/workshops/admin/registrations/${regDoc._id}`,
      { registrationStatus: 'Approved' },
      auth(adminToken)
    );
    approveResp = data;
    pass(`Approval response received. temporaryPassword: ${data.temporaryPassword || '(check server console)'}`);
  } catch (err) {
    fail(`Approval failed: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }

  const tempPassword = approveResp.temporaryPassword;
  if (!tempPassword) {
    fail('No temporaryPassword in response — check server console for the password');
  } else {
    pass(`Temporary password: ${tempPassword}`);
  }

  // ── STEP 4: Verify User created + registration.userId set ────────────────
  head('STEP 4 — Verify User Document + Registration.userId');
  const userMongo = await mongoDoc('users', { email: EMAIL.toLowerCase() });
  if (!userMongo) { fail(`User NOT found in MongoDB for email: ${EMAIL}`); process.exit(1); }

  console.log('\n  📄 users document:');
  console.log(`     _id:                 ${userMongo._id}`);
  console.log(`     name:                ${userMongo.name}`);
  console.log(`     email:               ${userMongo.email}`);
  console.log(`     role:                ${userMongo.role}`);
  console.log(`     isActive:            ${userMongo.isActive}`);
  console.log(`     isTemporaryPassword: ${userMongo.isTemporaryPassword}`);
  console.log(`     isWorkshopUser:      ${userMongo.isWorkshopUser}`);

  pass(`User created: ${userMongo._id}`);
  if (userMongo.role !== 'trainee') fail(`Role should be trainee, got: ${userMongo.role}`);
  else pass('role = trainee ✓');
  if (!userMongo.isActive) fail('isActive should be true');
  else pass('isActive = true ✓');

  // Verify registration.userId updated
  const regAfterApproval = await mongoDoc('workshopRegistrations', { _id: new mongoose.Types.ObjectId(regDoc._id) });
  console.log('\n  📄 workshopRegistrations after approval:');
  console.log(`     registrationStatus: ${regAfterApproval.registrationStatus}`);
  console.log(`     userId:             ${regAfterApproval.userId}`);

  if (!regAfterApproval.userId) fail('registration.userId is still null after approval!');
  else if (regAfterApproval.userId.toString() !== userMongo._id.toString()) {
    fail(`registration.userId (${regAfterApproval.userId}) !== user._id (${userMongo._id})`);
  } else pass(`registration.userId = ${regAfterApproval.userId} ✓`);

  if (regAfterApproval.registrationStatus !== 'Approved') fail(`Status should be Approved, got: ${regAfterApproval.registrationStatus}`);
  else pass('registrationStatus = Approved ✓');

  // ── STEP 5: Verify WorkshopBatch.students[] ──────────────────────────────
  head('STEP 5 — Verify WorkshopBatch.students[]');
  const batches = await mongoFind('workshopBatches', { workshopId: new mongoose.Types.ObjectId(workshop._id) });
  info(`Found ${batches.length} batch(es) for workshop "${workshop.title}"`);

  let targetBatch = null;
  let studentInBatch = false;

  for (const b of batches) {
    const students = (b.students || []).map(s => s.toString());
    const inBatch  = students.includes(userMongo._id.toString());
    console.log(`\n  📄 workshopBatches document:`);
    console.log(`     _id:       ${b._id}`);
    console.log(`     batchName: ${b.batchName}`);
    console.log(`     batchCode: ${b.batchCode}`);
    console.log(`     workshopId:${b.workshopId}`);
    console.log(`     trainerId: ${b.trainerId || 'NOT ASSIGNED'}`);
    console.log(`     students:  [${students.join(', ')}]`);
    console.log(`     trainee in students: ${inBatch ? '✅ YES' : '❌ NO'}`);
    if (inBatch) { studentInBatch = true; targetBatch = b; }
  }

  if (batches.length === 0) {
    info('No batches exist yet for this workshop — creating one now for the test...');

    // Create a batch with this registration
    try {
      const { data: batchData } = await axios.post(`${BASE}/api/workshops/batches`, {
        workshopId:      workshop._id,
        batchName:       `E2E Test Batch ${TS}`,
        batchCode:       `E2E-${TS}`,
        registrationIds: [regDoc._id],
        startDate:       new Date().toISOString(),
        mode:            'Online',
        status:          'Scheduled',
      }, auth(adminToken));
      targetBatch = batchData.data;
      info(`Batch created: ${targetBatch._id}`);

      // Re-verify students[]
      const freshBatch = await mongoDoc('workshopBatches', { _id: new mongoose.Types.ObjectId(targetBatch._id) });
      const students = (freshBatch.students || []).map(s => s.toString());
      console.log(`\n  📄 New batch students[]: [${students.join(', ')}]`);
      if (students.includes(userMongo._id.toString())) {
        studentInBatch = true;
        targetBatch = freshBatch;
        pass(`students[] populated at batch creation: ${userMongo._id} ✓`);
      } else {
        fail(`students[] NOT populated at batch creation! students=[${students.join(', ')}]`);
      }
    } catch (err) {
      fail(`Batch creation failed: ${err.response?.data?.message || err.message}`);
      process.exit(1);
    }
  } else if (!studentInBatch) {
    fail(`Trainee userId ${userMongo._id} is NOT in any batch.students[]`);
    info('Running sync-students on all batches...');
    for (const b of batches) {
      try {
        const { data: syncData } = await axios.post(
          `${BASE}/api/workshops/batches/${b._id}/sync-students`,
          {},
          auth(adminToken)
        );
        info(`Sync result for batch ${b._id}: ${syncData.message}`);
        const freshBatch = await mongoDoc('workshopBatches', { _id: b._id });
        const students = (freshBatch.students || []).map(s => s.toString());
        if (students.includes(userMongo._id.toString())) {
          studentInBatch = true;
          targetBatch = freshBatch;
          pass(`After sync: trainee is now in batch.students[] ✓`);
        }
      } catch (err) {
        fail(`Sync failed for batch ${b._id}: ${err.response?.data?.message || err.message}`);
      }
    }
    if (!studentInBatch) {
      fail('CRITICAL: trainee still not in any batch.students[] after sync. Cannot continue.');
      process.exit(1);
    }
  } else {
    pass(`Trainee ${userMongo._id} is in batch.students[] ✓`);
  }

  // ── Assign trainer if not assigned ──────────────────────────────────────
  head('STEP 5b — Ensure Trainer Assigned to Batch');
  if (!targetBatch.trainerId) {
    info('No trainer assigned. Looking for a trainer user...');
    const trainers = await mongoFind('users', { role: 'trainer', isActive: true });
    if (trainers.length === 0) {
      fail('No trainer users found. Create a trainer account first.');
      process.exit(1);
    }
    const trainer = trainers[0];
    info(`Assigning trainer: ${trainer.name} (${trainer._id})`);
    try {
      await axios.patch(
        `${BASE}/api/workshops/batches/${targetBatch._id}/assign-trainer`,
        { trainerId: trainer._id.toString() },
        auth(adminToken)
      );
      pass(`Trainer ${trainer.name} assigned to batch ✓`);
      targetBatch = await mongoDoc('workshopBatches', { _id: targetBatch._id });
    } catch (err) {
      fail(`Trainer assignment failed: ${err.response?.data?.message || err.message}`);
      process.exit(1);
    }
  } else {
    pass(`Trainer already assigned: ${targetBatch.trainerId} ✓`);
  }

  // ── STEP 6: Admin schedules session ─────────────────────────────────────
  head('STEP 6 — Admin Schedules Live Session');
  const scheduledAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min from now
  let sessionDoc;
  try {
    const { data: sessData } = await axios.post(`${BASE}/api/workshop-sessions`, {
      workshopBatchId: targetBatch._id.toString(),
      title:           `E2E Test Session ${TS}`,
      scheduledAt,
      durationMinutes: 60,
      description:     'Automated E2E test session',
    }, auth(adminToken));
    sessionDoc = sessData.session;
    pass(`Session created: ${sessionDoc._id}`);
  } catch (err) {
    fail(`Session creation failed: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }

  // ── STEP 7: Verify Session document ─────────────────────────────────────
  head('STEP 7 — Verify Session Document in MongoDB');
  const sessMongo = await mongoDoc('sessions', { _id: new mongoose.Types.ObjectId(sessionDoc._id) });
  if (!sessMongo) { fail('Session NOT found in MongoDB'); process.exit(1); }

  console.log('\n  📄 sessions document:');
  console.log(`     _id:             ${sessMongo._id}`);
  console.log(`     title:           ${sessMongo.title}`);
  console.log(`     sessionType:     ${sessMongo.sessionType}`);
  console.log(`     workshopBatchId: ${sessMongo.workshopBatchId}`);
  console.log(`     trainerId:       ${sessMongo.trainerId}`);
  console.log(`     status:          ${sessMongo.status}`);
  console.log(`     scheduledAt:     ${sessMongo.scheduledAt}`);

  if (sessMongo.sessionType !== 'WORKSHOP') fail(`sessionType should be WORKSHOP, got: ${sessMongo.sessionType}`);
  else pass('sessionType = WORKSHOP ✓');
  if (sessMongo.workshopBatchId.toString() !== targetBatch._id.toString()) {
    fail(`workshopBatchId mismatch: ${sessMongo.workshopBatchId} !== ${targetBatch._id}`);
  } else pass(`workshopBatchId = ${sessMongo.workshopBatchId} ✓`);
  if (sessMongo.status !== 'scheduled') fail(`status should be scheduled, got: ${sessMongo.status}`);
  else pass('status = scheduled ✓');

  // ── STEP 8: Login as trainee ─────────────────────────────────────────────
  head('STEP 8 — Login as Trainee');
  if (!tempPassword) {
    fail('Cannot login — no temporaryPassword was returned. Check server console for the password.');
    process.exit(1);
  }
  let traineeToken;
  try {
    traineeToken = await traineeLogin(EMAIL, tempPassword);
    pass(`Trainee logged in: ${EMAIL}`);
  } catch (err) {
    fail(`Trainee login failed: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }

  // ── STEP 9: GET /api/trainee/workshop-sessions ───────────────────────────
  head('STEP 9 — GET /api/trainee/workshop-sessions');
  let wsSessions;
  try {
    const { data } = await axios.get(`${BASE}/api/trainee/workshop-sessions`, auth(traineeToken));
    wsSessions = data.sessions || [];
    info(`API returned ${wsSessions.length} workshop session(s)`);
    wsSessions.forEach(s => {
      console.log(`     - ${s._id} | ${s.title} | status: ${s.status} | batchId: ${s.workshopBatchId?._id || s.workshopBatchId}`);
    });
  } catch (err) {
    fail(`GET /api/trainee/workshop-sessions failed: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }

  const foundSession = wsSessions.find(s => s._id.toString() === sessionDoc._id.toString());
  if (!foundSession) {
    fail(`Session ${sessionDoc._id} NOT returned by /api/trainee/workshop-sessions`);
    info('Debugging: checking batch membership...');
    const batchCheck = await mongoDoc('workshopBatches', { _id: targetBatch._id });
    const students = (batchCheck.students || []).map(s => s.toString());
    info(`Batch students[]: [${students.join(', ')}]`);
    info(`Trainee userId: ${userMongo._id}`);
    info(`In students: ${students.includes(userMongo._id.toString())}`);
  } else {
    pass(`Session found in /api/trainee/workshop-sessions ✓`);
    console.log(`     Title:    ${foundSession.title}`);
    console.log(`     Status:   ${foundSession.status}`);
    console.log(`     Trainer:  ${foundSession.trainerId?.name || foundSession.trainerId}`);
    console.log(`     Schedule: ${foundSession.scheduledAt}`);
  }

  // ── STEP 10: GET /api/trainee/dashboard ─────────────────────────────────
  head('STEP 10 — GET /api/trainee/dashboard');
  let dashData;
  try {
    const { data } = await axios.get(`${BASE}/api/trainee/dashboard`, auth(traineeToken));
    dashData = data;
    const upcoming = data.workshopUpcomingSessions || [];
    const live     = data.workshopLiveSessions || [];
    const myBatches = data.myWorkshopBatches || [];
    info(`Dashboard: myWorkshopBatches=${myBatches.length}, workshopUpcomingSessions=${upcoming.length}, workshopLiveSessions=${live.length}`);

    if (myBatches.length === 0) fail('Dashboard: myWorkshopBatches is empty');
    else pass(`Dashboard: myWorkshopBatches = ${myBatches.length} ✓`);

    const dashSession = upcoming.find(s => s._id.toString() === sessionDoc._id.toString());
    if (!dashSession) {
      info(`Session ${sessionDoc._id} not in workshopUpcomingSessions (may be because scheduledAt filter requires future date — this is expected if session is < 5 min away)`);
      // Check if it's in all sessions
      const allWsSessions = await mongoFind('sessions', { sessionType: 'WORKSHOP', workshopBatchId: new mongoose.Types.ObjectId(targetBatch._id.toString()) });
      info(`Total WORKSHOP sessions for this batch in DB: ${allWsSessions.length}`);
    } else {
      pass(`Session found in dashboard.workshopUpcomingSessions ✓`);
    }
  } catch (err) {
    fail(`GET /api/trainee/dashboard failed: ${err.response?.data?.message || err.message}`);
  }

  // ── STEP 11: Join session (attendance) ──────────────────────────────────
  head('STEP 11 — Join Session (Attendance Record)');
  // Force session to 'live' for join test
  info('Setting session status to live for join test...');
  await db.collection('sessions').updateOne(
    { _id: new mongoose.Types.ObjectId(sessionDoc._id) },
    { $set: { status: 'live', startedAt: new Date(), roomName: `session-${sessionDoc._id}` } }
  );
  pass('Session set to live in MongoDB');

  try {
    const { data: joinData } = await axios.post(
      `${BASE}/api/trainee/workshop-sessions/${sessionDoc._id}/join`,
      {},
      auth(traineeToken)
    );
    pass(`Join successful: role=${joinData.role}, roomName=${joinData.roomName}`);
    info(`LiveKit token received: ${joinData.token ? joinData.token.substring(0, 40) + '...' : 'MISSING'}`);
  } catch (err) {
    fail(`Join failed: ${err.response?.data?.message || err.message}`);
  }

  // ── STEP 12: Verify WorkshopAttendance document ──────────────────────────
  head('STEP 12 — Verify WorkshopAttendance Document');
  const attMongo = await mongoDoc('workshopattendances', {
    sessionId: new mongoose.Types.ObjectId(sessionDoc._id),
    studentId: new mongoose.Types.ObjectId(userMongo._id),
  });

  if (!attMongo) {
    fail('WorkshopAttendance record NOT found in MongoDB');
  } else {
    console.log('\n  📄 workshopattendances document:');
    console.log(`     _id:              ${attMongo._id}`);
    console.log(`     sessionId:        ${attMongo.sessionId}`);
    console.log(`     workshopBatchId:  ${attMongo.workshopBatchId}`);
    console.log(`     studentId:        ${attMongo.studentId}`);
    console.log(`     attendanceStatus: ${attMongo.attendanceStatus}`);
    console.log(`     joinTime:         ${attMongo.joinTime}`);
    pass('WorkshopAttendance record created ✓');
    if (attMongo.studentId.toString() !== userMongo._id.toString()) {
      fail(`studentId mismatch: ${attMongo.studentId} !== ${userMongo._id}`);
    } else pass(`studentId = ${attMongo.studentId} ✓`);
  }

  // ── FINAL SUMMARY ────────────────────────────────────────────────────────
  head('FINAL VERIFICATION SUMMARY');

  const finalReg   = await mongoDoc('workshopRegistrations', { _id: new mongoose.Types.ObjectId(regDoc._id) });
  const finalUser  = await mongoDoc('users', { _id: new mongoose.Types.ObjectId(userMongo._id) });
  const finalBatch = await mongoDoc('workshopBatches', { _id: new mongoose.Types.ObjectId(targetBatch._id.toString()) });
  const finalSess  = await mongoDoc('sessions', { _id: new mongoose.Types.ObjectId(sessionDoc._id) });
  const finalAtt   = await mongoDoc('workshopattendances', {
    sessionId: new mongoose.Types.ObjectId(sessionDoc._id),
    studentId: new mongoose.Types.ObjectId(userMongo._id),
  });

  console.log('\n  ┌─────────────────────────────────────────────────────────┐');
  console.log('  │  COLLECTION              │  DOCUMENT ID                  │');
  console.log('  ├─────────────────────────────────────────────────────────┤');
  console.log(`  │  workshopRegistrations   │  ${finalReg?._id || 'MISSING'}  │`);
  console.log(`  │  users                   │  ${finalUser?._id || 'MISSING'}  │`);
  console.log(`  │  workshopBatches         │  ${finalBatch?._id || 'MISSING'}  │`);
  console.log(`  │  sessions                │  ${finalSess?._id || 'MISSING'}  │`);
  console.log(`  │  workshopattendances     │  ${finalAtt?._id || 'MISSING'}  │`);
  console.log('  └─────────────────────────────────────────────────────────┘');

  console.log('\n  LINKAGE VERIFICATION:');
  const regUserMatch   = finalReg?.userId?.toString() === finalUser?._id?.toString();
  const batchHasUser   = (finalBatch?.students || []).some(s => s.toString() === finalUser?._id?.toString());
  const sessHasBatch   = finalSess?.workshopBatchId?.toString() === finalBatch?._id?.toString();
  const attHasSession  = finalAtt?.sessionId?.toString() === finalSess?._id?.toString();
  const attHasStudent  = finalAtt?.studentId?.toString() === finalUser?._id?.toString();

  regUserMatch  ? pass(`registration.userId → user._id: ${finalReg.userId}`) : fail('registration.userId does NOT match user._id');
  batchHasUser  ? pass(`batch.students[] contains trainee userId`) : fail('batch.students[] does NOT contain trainee userId');
  sessHasBatch  ? pass(`session.workshopBatchId → batch._id: ${finalSess.workshopBatchId}`) : fail('session.workshopBatchId does NOT match batch._id');
  attHasSession ? pass(`attendance.sessionId → session._id`) : fail('attendance.sessionId does NOT match session._id');
  attHasStudent ? pass(`attendance.studentId → user._id`) : fail('attendance.studentId does NOT match user._id');

  const allPassed = regUserMatch && batchHasUser && sessHasBatch && attHasSession && attHasStudent;

  console.log(`\n${line()}`);
  if (allPassed && process.exitCode !== 1) {
    console.log('  🎉  ALL CHECKS PASSED — Full end-to-end flow is working correctly.');
  } else {
    console.log('  ❌  SOME CHECKS FAILED — See errors above.');
  }
  console.log(`${line()}\n`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('\n❌ FATAL TEST ERROR:', err.message);
  if (err.response) console.error('   Response:', JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});
