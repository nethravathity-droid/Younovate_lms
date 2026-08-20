const axios = require('axios');

const API = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@younovate.in';
const ADMIN_PASSWORD = 'Admin@1234';
const TRAINER_EMAIL = 'trainer@younovate.in';
const TRAINER_PASSWORD = 'Trainer@1234';

async function login(email, password) {
  const res = await axios.post(`${API}/api/auth/login`, { email, password });
  return res.data.accessToken;
}

async function main() {
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const trainerToken = await login(TRAINER_EMAIL, TRAINER_PASSWORD);

  // Test trainer dashboard
  console.log('Testing Trainer Dashboard...');
  const start = Date.now();
  const dashRes = await axios.get(`${API}/api/trainer/dashboard`, {
    headers: { Authorization: `Bearer ${trainerToken}` },
    timeout: 60000,
  });
  console.log(`Trainer Dashboard: ${Date.now() - start}ms`);
  console.log('Keys:', Object.keys(dashRes.data));
  console.log('upcomingSessions:', dashRes.data.upcomingSessions?.length);
  console.log('liveSessions:', dashRes.data.liveSessions?.length);
  console.log('totalTrainees:', dashRes.data.totalTrainees);
  console.log('trainees count:', dashRes.data.trainees?.length);
  console.log('pendingGrades:', dashRes.data.pendingGrades);
  console.log('myWorkshopBatches:', dashRes.data.myWorkshopBatches?.length);
  console.log('workshopSessions:', dashRes.data.workshopSessions?.length);

  // Test with detailed timing
  console.log('\n--- Detailed timing ---');
  const start2 = Date.now();
  const sessionsRes = await axios.get(`${API}/api/trainer/sessions`, {
    headers: { Authorization: `Bearer ${trainerToken}` },
    timeout: 60000,
  });
  console.log(`Trainer Sessions: ${Date.now() - start2}ms, count: ${sessionsRes.data.sessions?.length || 0}`);

  console.log('\nDone');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
