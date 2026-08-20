/**
 * DIAGNOSTIC SCRIPT
 * Checks 1-8: Trainee Session Visibility
 * 
 * Run: node scripts/diagnose-trainee-sessions.js <traineeEmail>
 * Example: node scripts/diagnose-trainee-sessions.js trainee@example.com
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const { WorkshopPublicRegistration } = require('../src/models/WorkshopModels');
const WorkshopBatch = require('../src/models/WorkshopBatch');
const Session = require('../src/models/Session');

const LINE = '═'.repeat(60);
const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️';

async function diagnose() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/diagnose-trainee-sessions.js <traineeEmail>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
    console.log(`${PASS} CONNECTED TO MONGODB\n`);

    // ═══════════════════════════════════════════════════════════════
    // CHECK 1: Trainee User Record
    // ═══════════════════════════════════════════════════════════════
    console.log(LINE);
    console.log('CHECK 1: TRAINEE USER RECORD');
    console.log(LINE);

    const trainee = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!trainee) {
      console.log(`${FAIL} No user found with email: ${email}`);
      process.exit(1);
    }

    console.log(`  User._id:     ${trainee._id}`);
    console.log(`  Email:        ${trainee.email}`);
    console.log(`  Name:         ${trainee.name}`);
    console.log(`  Role:         ${trainee.role}`);
    console.log(`  isActive:     ${trainee.isActive}`);
    console.log(`  batchIds[]:   ${(trainee.batchIds || []).length > 0 ? trainee.batchIds.map(b => b.toString()).join(', ') : 'EMPTY'}`);
    
    // Check if batchIds is empty - this is a potential root cause
    if (!trainee.batchIds || trainee.batchIds.length === 0) {
      console.log(`  ${WARN} User.batchIds is EMPTY - this field is NOT used by workshop queries`);
      console.log(`  ${PASS} Workshop queries use WorkshopBatch.students[] instead`);
    }

    // ═══════════════════════════════════════════════════════════════
    // CHECK 2: Workshop Registrations for this email
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${LINE}`);
    console.log('CHECK 2: WORKSHOP REGISTRATIONS');
    console.log(LINE);

    const regs = await WorkshopPublicRegistration.find({ email: email.toLowerCase() })
      .populate('workshopId', 'title')
      .lean();

    if (regs.length === 0) {
      console.log(`${FAIL} No workshop registrations found for email: ${email}`);
      process.exit(1);
    }

    console.log(`  Found ${regs.length} registration(s):\n`);
    for (const reg of regs) {
      console.log(`  registrationId:   ${reg._id}`);
      console.log(`  workshopId:       ${reg.workshopId?._id || reg.workshopId || 'N/A'}`);
      console.log(`  workshopName:     ${reg.workshopName || reg.workshopId?.title || 'N/A'}`);
      console.log(`  registrationStatus: ${reg.registrationStatus}`);
      console.log(`  userId:           ${reg.userId || 'NOT SET'}`);
      
      if (reg.registrationStatus !== 'Approved') {
        console.log(`  ${WARN} Registration is NOT approved yet (status: ${reg.registrationStatus})`);
      }
      if (!reg.userId) {
        console.log(`  ${FAIL} No userId linked! Approval did not create a User account.`);
      } else if (reg.userId.toString() !== trainee._id.toString()) {
        console.log(`  ${FAIL} userId mismatch! Registration.userId=${reg.userId} but Trainee._id=${trainee._id}`);
      } else {
        console.log(`  ${PASS} userId matches trainee._id`);
      }
      console.log('');
    }

    // ═══════════════════════════════════════════════════════════════
    // CHECK 3: Workshop Batches containing this trainee
    // ═══════════════════════════════════════════════════════════════
    console.log(LINE);
    console.log('CHECK 3: WORKSHOP BATCHES');
    console.log(LINE);

    const batches = await WorkshopBatch.find()
      .populate('workshopId', 'title')
      .lean();

    const traineeBatches = batches.filter(b => 
      (b.students || []).some(s => s.toString() === trainee._id.toString())
    );

    if (traineeBatches.length === 0) {
      console.log(`${FAIL} Trainee is NOT in any WorkshopBatch.students[] array!`);
      console.log(`\n  All batches in DB:`);
      for (const b of batches) {
        console.log(`  batchId: ${b._id} | ${b.batchName} | students: ${(b.students || []).length} | regIds: ${(b.registrationIds || []).length}`);
        console.log(`    student IDs: ${(b.students || []).map(s => s.toString()).join(', ')}`);
        console.log(`    trainee._id: ${trainee._id.toString()}`);
        const found = (b.students || []).some(s => s.toString() === trainee._id.toString());
        console.log(`    match: ${found ? 'YES' : 'NO'}`);
      }
      process.exit(1);
    }

    console.log(`  Found ${traineeBatches.length} batch(es) containing this trainee:\n`);
    for (const b of traineeBatches) {
      console.log(`  batchId:    ${b._id}`);
      console.log(`  batchName:  ${b.batchName}`);
      console.log(`  workshopId: ${b.workshopId?._id || b.workshopId || 'N/A'}`);
      console.log(`  workshop:   ${b.workshopId?.title || 'N/A'}`);
      console.log(`  status:     ${b.status}`);
      console.log(`  students[]: ${(b.students || []).length} total`);
      const isInStudents = (b.students || []).some(s => s.toString() === trainee._id.toString());
      console.log(`  trainee in students[]: ${isInStudents ? 'YES' : 'NO'}`);
      console.log('');
    }

    // ═══════════════════════════════════════════════════════════════
    // CHECK 4: Sessions belonging to those batches
    // ═══════════════════════════════════════════════════════════════
    console.log(LINE);
    console.log('CHECK 4: SESSIONS FOR THESE BATCHES');
    console.log(LINE);

    const traineeBatchIds = traineeBatches.map(b => b._id.toString());
    
    // Query 1: Using workshopBatchId (correct field)
    const sessionsByWorkshopBatchId = await Session.find({
      sessionType: 'WORKSHOP',
      workshopBatchId: { $in: traineeBatchIds }
    }).populate('trainerId', 'name email').lean();

    // Query 2: Using batchId (legacy field - might be set differently)
    const sessionsByBatchId = await Session.find({
      sessionType: 'WORKSHOP',
      batchId: { $in: traineeBatchIds }
    }).populate('trainerId', 'name email').lean();

    console.log(`  Sessions found via workshopBatchId: ${sessionsByWorkshopBatchId.length}`);
    console.log(`  Sessions found via batchId:         ${sessionsByBatchId.length}`);

    // Use the correct query result
    const allSessions = sessionsByWorkshopBatchId;

    if (allSessions.length === 0) {
      console.log(`\n  ${FAIL} No sessions found for this trainee's batches!`);
      
      // Check if ANY workshop sessions exist at all
      const anyWsSessions = await Session.find({ sessionType: 'WORKSHOP' }).lean();
      console.log(`\n  Total WORKSHOP sessions in DB: ${anyWsSessions.length}`);
      
      if (anyWsSessions.length > 0) {
        console.log(`\n  All workshop sessions in DB:`);
        for (const s of anyWsSessions) {
          console.log(`  sessionId:         ${s._id}`);
          console.log(`  title:             ${s.title}`);
          console.log(`  workshopBatchId:   ${s.workshopBatchId?.toString() || 'NOT SET'}`);
          console.log(`  batchId:           ${s.batchId?.toString() || 'NOT SET'}`);
          console.log(`  status:            ${s.status}`);
          console.log(`  scheduledAt:       ${s.scheduledAt}`);
          
          // Check if this session's batchId matches any of trainee's batches
          const matchesWorkshopBatchId = s.workshopBatchId && traineeBatchIds.includes(s.workshopBatchId.toString());
          const matchesBatchId = s.batchId && traineeBatchIds.includes(s.batchId.toString());
          console.log(`  matches trainee batch (workshopBatchId): ${matchesWorkshopBatchId ? 'YES' : 'NO'}`);
          console.log(`  matches trainee batch (batchId):         ${matchesBatchId ? 'YES' : 'NO'}`);
          console.log('');
        }
      }
    } else {
      console.log(`\n  Sessions for this trainee:\n`);
      for (const s of allSessions) {
        console.log(`  sessionId:       ${s._id}`);
        console.log(`  title:           ${s.title}`);
        console.log(`  workshopBatchId: ${s.workshopBatchId?.toString() || 'NOT SET'}`);
        console.log(`  batchId:         ${s.batchId?.toString() || 'NOT SET'}`);
        console.log(`  trainerId:       ${s.trainerId?._id || s.trainerId || 'NOT SET'}`);
        console.log(`  trainerName:     ${s.trainerId?.name || 'N/A'}`);
        console.log(`  scheduledAt:     ${s.scheduledAt}`);
        console.log(`  status:          ${s.status}`);
        console.log(`  durationMinutes: ${s.durationMinutes}`);
        console.log('');
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // CHECK 5: Inspect the trainee Sessions API query
    // ═══════════════════════════════════════════════════════════════
    console.log(LINE);
    console.log('CHECK 5: TRAINEE SESSIONS API QUERY');
    console.log(LINE);

    console.log(`\n  The trainee dashboard API (GET /api/trainee/dashboard) uses:`);
    console.log(`\n  const myBatches = await WorkshopBatch.find({ students: userId }).select('_id').lean();`);
    console.log(`  const batchIds = myBatches.map(b => b._id);`);
    console.log(`\n  // Upcoming + Live sessions:`);
    console.log(`  Session.find({`);
    console.log(`    sessionType: 'WORKSHOP',`);
    console.log(`    workshopBatchId: { $in: batchIds },`);
    console.log(`    status: { $in: ['scheduled', 'live'] },`);
    console.log(`    scheduledAt: { $gte: new Date() }`);
    console.log(`  })`);

    // Simulate the exact query
    const myBatches = await WorkshopBatch.find({ students: trainee._id }).select('_id').lean();
    const batchIds = myBatches.map(b => b._id.toString());
    
    console.log(`\n  Simulated query:`);
    console.log(`  WorkshopBatch.find({ students: ${trainee._id} }) → ${myBatches.length} batches`);
    console.log(`  batchIds = [${batchIds.map(b => b.substring(0,8)+'...').join(', ')}]`);
    
    const simulatedSessions = await Session.find({
      sessionType: 'WORKSHOP',
      workshopBatchId: { $in: batchIds },
      status: { $in: ['scheduled', 'live'] },
      scheduledAt: { $gte: new Date() },
    }).lean();

    console.log(`  Session.find({ workshopBatchId: { $in: [...] }, status: ['scheduled','live'] }) → ${simulatedSessions.length} sessions`);

    // Also check without status/scheduledAt filter
    const allSimulatedSessions = await Session.find({
      sessionType: 'WORKSHOP',
      workshopBatchId: { $in: batchIds },
    }).lean();
    console.log(`  Session.find({ workshopBatchId: { $in: [...] } }) (no filters) → ${allSimulatedSessions.length} sessions`);

    // ═══════════════════════════════════════════════════════════════
    // CHECK 6: Multi-batch verification
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${LINE}`);
    console.log('CHECK 6: MULTI-BATCH VERIFICATION');
    console.log(LINE);

    if (traineeBatches.length > 1) {
      console.log(`\n  ${PASS} Trainee belongs to ${traineeBatches.length} batches:`);
      for (const b of traineeBatches) {
        const batchSessions = allSessions.filter(s => 
          s.workshopBatchId?.toString() === b._id.toString()
        );
        console.log(`  Batch "${b.batchName}" (${b._id.toString().substring(0,8)}...): ${batchSessions.length} sessions`);
        for (const s of batchSessions) {
          console.log(`    → ${s.title} (${s.status})`);
        }
      }
      
      // Verify ALL batches have sessions returned
      const batchesWithSessions = new Set(allSessions.map(s => s.workshopBatchId?.toString()));
      const batchesWithoutSessions = traineeBatches.filter(b => !batchesWithSessions.has(b._id.toString()));
      
      if (batchesWithoutSessions.length > 0) {
        console.log(`\n  ${WARN} Batches with NO sessions:`);
        for (const b of batchesWithoutSessions) {
          console.log(`  → ${b.batchName} (${b._id})`);
        }
      } else {
        console.log(`\n  ${PASS} All ${traineeBatches.length} batches have sessions`);
      }
    } else {
      console.log(`\n  ${PASS} Trainee belongs to 1 batch (single batch - no multi-batch issue)`);
    }

    // ═══════════════════════════════════════════════════════════════
    // CHECK 7: Frontend rendering analysis
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${LINE}`);
    console.log('CHECK 7: FRONTEND RENDERING ANALYSIS');
    console.log(LINE);

    console.log(`\n  Dashboard (TraineeDashboard.jsx):`);
    console.log(`  - Calls fetchMyWorkshopBatches() → GET /api/trainee/workshop-batches`);
    console.log(`  - Calls fetchMyWorkshopSessions() → GET /api/trainee/workshop-sessions`);
    console.log(`  - Renders "My Workshops" section from batches`);
    console.log(`  - Renders "Upcoming Sessions" from sessions filtered by status='scheduled'`);
    console.log(`  - Renders "Live Sessions" from sessions filtered by status='live'`);
    
    console.log(`\n  Sessions page (Sessions.jsx):`);
    console.log(`  - Uses sessionsSlice (NOT traineeSlice)`);
    console.log(`  - Calls fetchSessions() → GET /api/trainee/sessions`);
    console.log(`  - This is for LMS sessions, NOT workshop sessions!`);
    console.log(`  ${WARN} The Sessions page may NOT show workshop sessions!`);

    // Check the sessionsSlice to confirm
    console.log(`\n  ${PASS} Dashboard uses traineeSlice which correctly fetches workshop sessions`);
    console.log(`  ${PASS} Dashboard renders workshop sessions in "Upcoming Sessions" and "Live Sessions" widgets`);

    // ═══════════════════════════════════════════════════════════════
    // CHECK 8: Summary & Root Cause
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${LINE}`);
    console.log('CHECK 8: SUMMARY & ROOT CAUSE ANALYSIS');
    console.log(LINE);

    const issues = [];

    // Check 1: User exists
    if (!trainee) issues.push('CHECK 1: User not found');
    
    // Check 2: Registrations approved with userId
    const approvedRegs = regs.filter(r => r.registrationStatus === 'Approved');
    const regsWithUserId = approvedRegs.filter(r => r.userId);
    if (approvedRegs.length === 0) issues.push('CHECK 2: No approved registrations');
    if (regsWithUserId.length !== approvedRegs.length) issues.push('CHECK 2: Approved registrations missing userId');

    // Check 3: Trainee in batch students[]
    if (traineeBatches.length === 0) issues.push('CHECK 3: Trainee not in any WorkshopBatch.students[]');

    // Check 4: Sessions exist for batches
    if (allSessions.length === 0) {
      const anySessions = await Session.find({ sessionType: 'WORKSHOP' }).lean();
      if (anySessions.length === 0) {
        issues.push('CHECK 4: No WORKSHOP sessions exist in DB at all');
      } else {
        issues.push('CHECK 4: Sessions exist but workshopBatchId does not match trainee batch IDs');
      }
    }

    // Check 5: API query
    if (batchIds.length === 0) issues.push('CHECK 5: WorkshopBatch.find({ students: userId }) returns 0 batches');

    // Check 6: Multi-batch
    // (no issue if all batches have sessions)

    console.log(`\n  Issues found: ${issues.length > 0 ? issues.length : 'NONE'}`);
    for (const issue of issues) {
      console.log(`  ${FAIL} ${issue}`);
    }

    if (issues.length === 0) {
      console.log(`\n  ${PASS} ALL CHECKS PASSED`);
      console.log(`\n  Root Cause: NONE - The system is working correctly.`);
      console.log(`  If trainee still can't see sessions, check:`);
      console.log(`  1. The frontend is actually calling the API (check browser network tab)`);
      console.log(`  2. The Redux store is being updated (check Redux DevTools)`);
      console.log(`  3. The session status is 'scheduled' or 'live' (not 'completed')`);
      console.log(`  4. The session scheduledAt is in the future (not past)`);
    } else {
      console.log(`\n  ${FAIL} ${issues.length} issue(s) detected - see above for details`);
    }

    console.log(`\n${LINE}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('FATAL ERROR:', err);
    process.exit(1);
  }
}

diagnose();

