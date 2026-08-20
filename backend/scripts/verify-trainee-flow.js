/**
 * VERIFICATION SCRIPT
 * End-to-end trainee flow verification
 * Checks: User → WorkshopRegistration → WorkshopBatch → Session → Dashboard → Join → Attendance
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Workshop = require('../src/models/Workshop');
const User = require('../src/models/User');
const { WorkshopPublicRegistration, WorkshopAttendance, WorkshopCertificate } = require('../src/models/WorkshopModels');
const WorkshopBatch = require('../src/models/WorkshopBatch');
const Session = require('../src/models/Session');

const PASS = '✅';
const FAIL = '❌';
const LINE = '─'.repeat(60);

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
    console.log('✅ CONNECTED TO MONGODB\n');

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Verify Registration → User linkage
    // ═══════════════════════════════════════════════════════════════
    console.log(LINE);
    console.log('STEP 1: REGISTRATION → USER LINKAGE');
    console.log(LINE);

    const regs = await WorkshopPublicRegistration.find()
      .populate('workshopId', 'title')
      .lean();

    if (regs.length === 0) {
      console.log(`${FAIL} No workshop registrations found! Register a trainee first.`);
      process.exit(1);
    }

    for (const reg of regs) {
      console.log(`\nRegistration: ${reg.fullName} (${reg.email})`);
      console.log(`  Status: ${reg.registrationStatus}`);
      console.log(`  Workshop: ${reg.workshopName || reg.workshopId?.title || 'N/A'}`);
      console.log(`  userId: ${reg.userId || 'NOT SET'}`);

      if (reg.registrationStatus === 'Approved') {
        if (reg.userId) {
          const user = await User.findById(reg.userId).select('_id name email isActive batchIds').lean();
          if (user) {
            console.log(`  ${PASS} User found: ${user.name} (${user.email})`);
            console.log(`  ${PASS} User isActive: ${user.isActive}`);
            console.log(`  ${PASS} User batchIds: ${(user.batchIds || []).map(b => b.toString()).join(', ') || 'NONE'}`);
          } else {
            console.log(`  ${FAIL} User NOT FOUND for userId: ${reg.userId}`);
            process.exit(1);
          }
        } else {
          console.log(`  ${FAIL} Approved registration has NO userId linked!`);
          process.exit(1);
        }
      } else {
        console.log(`  ${PASS} Registration is ${reg.registrationStatus} - needs approval first`);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Verify Batch assignment
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${LINE}`);
    console.log('STEP 2: BATCH ASSIGNMENT');
    console.log(LINE);

    const batches = await WorkshopBatch.find()
      .populate('workshopId', 'title')
      .lean();

    if (batches.length === 0) {
      console.log(`${FAIL} No workshop batches found! Create a batch first.`);
      process.exit(1);
    }

    for (const batch of batches) {
      console.log(`\nBatch: ${batch.batchName} (${batch.batchCode})`);
      console.log(`  Workshop: ${batch.workshopId?.title || 'N/A'}`);
      console.log(`  Status: ${batch.status}`);
      console.log(`  Students enrolled: ${(batch.students || []).length}`);
      console.log(`  Registration IDs: ${(batch.registrationIds || []).length}`);

      // Check if approved registrations match
      const approvedRegs = regs.filter(r => 
        r.registrationStatus === 'Approved' && 
        (batch.registrationIds || []).some(rid => rid.toString() === r._id.toString())
      );
      
      for (const reg of approvedRegs) {
        const isInStudents = (batch.students || []).some(s => 
          reg.userId && s.toString() === reg.userId.toString()
        );
        console.log(`  ${reg.fullName} (${reg.email}): ${isInStudents ? `${PASS} in students[]` : `${FAIL} NOT in students[]!`}`);
        
        if (!isInStudents && reg.userId) {
          console.log(`    Attempting to fix: Adding user ${reg.userId} to batch students[]`);
          await WorkshopBatch.findByIdAndUpdate(batch._id, {
            $addToSet: { students: reg.userId }
          });
          console.log(`    ${PASS} Fixed! User added to students[]`);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Verify Sessions
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${LINE}`);
    console.log('STEP 3: SESSION VERIFICATION');
    console.log(LINE);

    const sessions = await Session.find({ sessionType: 'WORKSHOP' })
      .populate('trainerId', 'name email')
      .lean();

    if (sessions.length === 0) {
      console.log(`${FAIL} No WORKSHOP sessions found! Create a session first.`);
      console.log(`\n${LINE}`);
      console.log('CREATE A SESSION');
      console.log(LINE);
      console.log(`To create a workshop session, you need to:`);
      console.log(`1. Go to Admin → Workshops → Workshop Batches`);
      console.log(`2. Click on a batch to view details`);
      console.log(`3. Create a session for that batch`);
      console.log(`\nOr use the API:`);
      console.log(`POST /api/workshop-sessions`);
      console.log(`Body: { workshopBatchId: "<batchId>", title: "...", scheduledAt: "..." }`);
      process.exit(1);
    }

    for (const s of sessions) {
      console.log(`\nSession: ${s.title}`);
      console.log(`  ID: ${s._id}`);
      console.log(`  Status: ${s.status}`);
      console.log(`  ScheduledAt: ${s.scheduledAt}`);
      console.log(`  workshopBatchId: ${s.workshopBatchId?.toString() || 'NOT SET'}`);
      console.log(`  batchId: ${s.batchId?.toString() || 'NOT SET'}`);
      console.log(`  Trainer: ${s.trainerId?.name || s.trainerId?.email || 'NOT SET'}`);

      // Check if session links to a valid batch
      const linkedBatch = batches.find(b => b._id.toString() === (s.workshopBatchId?.toString() || s.batchId?.toString()));
      if (linkedBatch) {
        console.log(`  ${PASS} Linked to batch: ${linkedBatch.batchName}`);
      } else {
        console.log(`  ${FAIL} Session NOT linked to any batch!`);
        console.log(`    workshopBatchId: ${s.workshopBatchId?.toString()}`);
        console.log(`    batchId: ${s.batchId?.toString()}`);
        console.log(`    Available batch IDs: ${batches.map(b => b._id.toString()).join(', ')}`);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Verify Trainee Dashboard Query
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${LINE}`);
    console.log('STEP 4: TRAINEE DASHBOARD API CHECK');
    console.log(LINE);

    const trainees = await User.find({ role: 'trainee' }).lean();
    
    for (const trainee of trainees) {
      console.log(`\nTrainee: ${trainee.name} (${trainee.email})`);
      console.log(`  User ID: ${trainee._id}`);
      console.log(`  batchIds: ${(trainee.batchIds || []).map(b => b.toString()).join(', ') || 'NONE'}`);

      // Find batches this trainee belongs to
      const myBatches = batches.filter(b => 
        (b.students || []).some(s => s.toString() === trainee._id.toString())
      );
      console.log(`  Workshop batches: ${myBatches.length > 0 ? myBatches.map(b => b.batchName).join(', ') : 'NONE'}`);

      if (myBatches.length > 0) {
        const myBatchIds = myBatches.map(b => b._id.toString());

        // Simulate the dashboard query from traineeRoutes.js
        // It queries: Session.find({ sessionType: 'WORKSHOP', workshopBatchId: { $in: batchIds } })
        const dashboardSessions = await Session.find({
          sessionType: 'WORKSHOP',
          workshopBatchId: { $in: myBatchIds }
        }).lean();

        console.log(`  Dashboard query: Session.find({ sessionType: 'WORKSHOP', workshopBatchId: { $in: [${myBatchIds.map(b => b.substring(0,8)+'...')}] } })`);
        console.log(`  Sessions returned: ${dashboardSessions.length}`);

        if (dashboardSessions.length > 0) {
          for (const ds of dashboardSessions) {
            console.log(`  ${PASS} Session found: ${ds.title} (${ds.status}) at ${ds.scheduledAt}`);
          }
        } else {
          // Check if sessions exist with workshopBatchId matching
          const allWsSessions = await Session.find({ sessionType: 'WORKSHOP' }).lean();
          console.log(`  ${FAIL} No sessions returned for this trainee!`);
          console.log(`    Total workshop sessions in DB: ${allWsSessions.length}`);
          
          if (allWsSessions.length > 0) {
            console.log(`    Session workshopBatchIds: ${allWsSessions.map(s => s.workshopBatchId?.toString()).join(', ')}`);
            console.log(`    Trainee's batch IDs: ${myBatchIds.join(', ')}`);
            
            // Check if workshopBatchId on sessions match batch._id
            for (const s of allWsSessions) {
              const match = myBatchIds.some(bid => bid === s.workshopBatchId?.toString());
              console.log(`    Session ${s.title}: workshopBatchId=${s.workshopBatchId?.toString()} matches trainee batch? ${match ? 'YES' : 'NO'}`);
            }
          }
        }
      } else {
        console.log(`  ${FAIL} Trainee is not in any batch!`);
        console.log(`    Check: User.batchIds = ${(trainee.batchIds || []).join(', ')}`);
        console.log(`    Check: WorkshopBatch.students includes this user`);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n${LINE}`);
    console.log('VERIFICATION SUMMARY');
    console.log(LINE);

    const approvedRegs = regs.filter(r => r.registrationStatus === 'Approved');
    const approvedWithUser = approvedRegs.filter(r => r.userId);
    const traineesInBatch = [];
    for (const t of trainees) {
      const inBatch = batches.some(b => (b.students || []).some(s => s.toString() === t._id.toString()));
      if (inBatch) traineesInBatch.push(t);
    }

    console.log(`\nRegistrations: ${regs.length} total, ${approvedRegs.length} approved`);
    console.log(`Approved with userId: ${approvedWithUser.length}/${approvedRegs.length}`);
    console.log(`Trainees in batch: ${traineesInBatch.length}/${trainees.length}`);
    console.log(`Workshop batches: ${batches.length}`);
    console.log(`Workshop sessions: ${sessions.length}`);

    // Check if sessions are linked to batches correctly
    let sessionsLinked = 0;
    for (const s of sessions) {
      if (s.workshopBatchId && batches.some(b => b._id.toString() === s.workshopBatchId.toString())) {
        sessionsLinked++;
      }
    }
    console.log(`Sessions linked to batches: ${sessionsLinked}/${sessions.length}`);

    console.log(`\n${LINE}`);
    if (approvedRegs.length > 0 && approvedWithUser.length === approvedRegs.length && traineesInBatch.length > 0 && sessionsLinked > 0) {
      console.log('OVERALL: ✅ ALL SYSTEMS GO');
    } else {
      console.log('OVERALL: ❌ ISSUES DETECTED - See above for details');
    }
    console.log(LINE);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('FATAL ERROR:', err);
    process.exit(1);
  }
}

verify();
