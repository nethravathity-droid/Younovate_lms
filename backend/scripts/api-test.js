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

function countOf(data) {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (data.data && Array.isArray(data.data)) return data.data.length;
  if (data.sessions && Array.isArray(data.sessions)) return data.sessions.length;
  if (data.users && Array.isArray(data.users)) return data.users.length;
  if (data.batches && Array.isArray(data.batches)) return data.batches.length;
  if (data.registrations && Array.isArray(data.registrations)) return data.registrations.length;
  if (data.workshops && Array.isArray(data.workshops)) return data.workshops.length;
  if (data.students && Array.isArray(data.students)) return data.students.length;
  if (data.feedback && Array.isArray(data.feedback)) return data.feedback.length;
  if (data.recordings && Array.isArray(data.recordings)) return data.recordings.length;
  if (data.certificates && Array.isArray(data.certificates)) return data.certificates.length;
  if (typeof data.total === 'number') return data.total;
  if (typeof data.count === 'number') return data.count;
  return 'N/A';
}

async function testApi(name, url, token) {
  const start = Date.now();
  try {
    const res = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      timeout: 30000,
    });
    const ms = Date.now() - start;
    const count = countOf(res.data);
    console.log(`[${ms}ms] ${name}: ${count} records`);
    return { ms, count, data: res.data };
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`[${ms}ms] ${name}: ERROR - ${err.response?.data?.message || err.message}`);
    return { ms, count: 0, error: err.message };
  }
}

async function main() {
  console.log('Logging in as admin...');
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Admin login OK');

  console.log('\nLogging in as trainee...');
  const traineeToken = await login(TRAINEE_EMAIL, TRAINEE_PASSWORD);
  console.log('Trainee login OK');

  console.log('\n--- Admin API Tests ---');
  await testApi('Admin Dashboard', `${API}/api/admin/dashboard`, adminToken);
  await testApi('Admin Users (all)', `${API}/api/admin/users?limit=all`, adminToken);
  await testApi('Admin Trainees', `${API}/api/admin/users?role=trainee&limit=all`, adminToken);
  await testApi('Admin Trainers', `${API}/api/admin/users?role=trainer&limit=all`, adminToken);
  await testApi('Admin Batches', `${API}/api/admin/batches?limit=all`, adminToken);
  await testApi('Admin Sessions', `${API}/api/sessions?limit=200`, adminToken);
  await testApi('Admin Registrations', `${API}/api/admin/registrations?limit=all`, adminToken);
  await testApi('Admin Attendance', `${API}/api/admin/attendance`, adminToken);

  console.log('\n--- Workshop API Tests ---');
  await testApi('Workshops (public)', `${API}/api/workshops`, null);
  await testApi('Workshops Admin Stats', `${API}/api/workshops/admin/stats`, adminToken);
  await testApi('Workshops Admin All', `${API}/api/workshops/admin/all`, adminToken);
  await testApi('Workshops Admin Registrations', `${API}/api/workshops/admin/registrations`, adminToken);

  console.log('\n--- Trainee API Tests ---');
  await testApi('Trainee Dashboard', `${API}/api/trainee/dashboard`, traineeToken);
  await testApi('Trainee Sessions', `${API}/api/trainee/sessions`, traineeToken);
  await testApi('Trainee Attendance', `${API}/api/trainee/attendance`, traineeToken);
  await testApi('Trainee Assignments', `${API}/api/trainee/assignments`, traineeToken);
  await testApi('Trainee Workshop Batches', `${API}/api/trainee/workshop-batches`, traineeToken);
  await testApi('Trainee Workshop Sessions', `${API}/api/trainee/workshop-sessions`, traineeToken);
  await testApi('Trainee Workshop Attendance', `${API}/api/trainee/workshop-attendance`, traineeToken);
  await testApi('Trainee Workshop Certificates', `${API}/api/trainee/workshop-certificates`, traineeToken);

  console.log('\nDone');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
