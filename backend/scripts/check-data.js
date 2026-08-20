const axios = require('axios');

const API = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@younovate.in';
const ADMIN_PASSWORD = 'Admin@1234';
const TRAINEE_EMAIL = 'trainee@younovate.in';
const TRAINEE_PASSWORD = 'Trainee@1234';

async function login(email, password) {
  const res = await axios.post(`${API}/api/auth/login`, { email, password });
  return res.data.accessToken;
}

async function main() {
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const traineeToken = await login(TRAINEE_EMAIL, TRAINEE_PASSWORD);

  // Check admin sessions
  const sessionsRes = await axios.get(`${API}/api/sessions?limit=200`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('Admin sessions count:', sessionsRes.data.sessions?.length || sessionsRes.data.data?.length || 0);
  console.log('Admin sessions sample:', JSON.stringify(sessionsRes.data.sessions?.slice(0, 3) || [], null, 2));

  // Check trainee dashboard
  const traineeDash = await axios.get(`${API}/api/trainee/dashboard`, {
    headers: { Authorization: `Bearer ${traineeToken}` },
  });
  console.log('\nTrainee dashboard keys:', Object.keys(traineeDash.data));
  console.log('Trainee dashboard upcomingSessions:', traineeDash.data.upcomingSessions?.length || 0);
  console.log('Trainee dashboard pendingAssignments:', traineeDash.data.pendingAssignments);
  console.log('Trainee dashboard attendance:', JSON.stringify(traineeDash.data.attendance));
  console.log('Trainee dashboard myWorkshopBatches:', traineeDash.data.myWorkshopBatches?.length || 0);

  // Check if trainee@younovate.in appears in admin trainees list
  const traineesRes = await axios.get(`${API}/api/admin/users?role=trainee&limit=all`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const trainees = traineesRes.data.data?.users || traineesRes.data.data || [];
  const found = trainees.find(t => t.email === 'trainee@younovate.in');
  console.log('\nTrainee trainee@younovate.in in admin list:', found ? 'YES' : 'NO');
  if (found) {
    console.log('  batchIds:', found.batchIds);
    console.log('  isActive:', found.isActive);
  }

  // Check trainee sessions
  const traineeSessionsRes = await axios.get(`${API}/api/trainee/sessions`, {
    headers: { Authorization: `Bearer ${traineeToken}` },
  });
  console.log('\nTrainee sessions count:', traineeSessionsRes.data.sessions?.length || 0);
  console.log('Trainee sessions sample:', JSON.stringify(traineeSessionsRes.data.sessions?.slice(0, 2) || [], null, 2));

  // Check workshops
  const workshopsRes = await axios.get(`${API}/api/workshops`, {
    headers: { Authorization: `Bearer ${traineeToken}` },
  });
  console.log('\nPublic workshops count:', workshopsRes.data.data?.workshops?.length || 0);

  console.log('\nDone');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
