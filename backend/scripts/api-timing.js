const axios = require('axios');

async function main() {
  const API = 'http://localhost:8080';
  
  // Try to login with demo accounts
  const accounts = [
    { email: 'admin@younovate.in', password: 'Admin@1234' },
    { email: 'trainer@younovate.in', password: 'Trainer@1234' },
    { email: 'trainee@younovate.in', password: 'Trainee@1234' },
  ];
  
  let token = null;
  for (const acc of accounts) {
    try {
      const res = await axios.post(`${API}/api/auth/login`, acc);
      if (res.data.success && res.data.accessToken) {
        token = res.data.accessToken;
        console.log(`Logged in as ${acc.email} (${res.data.role})`);
        break;
      }
    } catch (e) {
      console.log(`Failed ${acc.email}: ${e.response?.data?.message || e.message}`);
    }
  }
  
  if (!token) {
    console.log('No demo account found, trying to find admin user...');
    // Try to find any user
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://127.0.0.1:27017/younovate_lms');
    const User = mongoose.models.User;
    const admin = await User.findOne({ role: 'admin', isActive: true });
    if (admin) {
      console.log('Found admin:', admin.email);
      // We can't easily get the password, so let's just report this
    }
    process.exit(1);
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test dashboard
  console.log('\n--- Testing Dashboard API ---');
  const dashStart = Date.now();
  try {
    const dashRes = await axios.get(`${API}/api/admin/dashboard`, { headers });
    console.log(`Dashboard: ${Date.now() - dashStart}ms`);
    console.log('Dashboard keys:', Object.keys(dashRes.data.data || {}).join(', '));
  } catch (e) {
    console.log(`Dashboard error: ${e.response?.data?.message || e.message}`);
  }
  
  // Test sessions list
  console.log('\n--- Testing Sessions API ---');
  const sessStart = Date.now();
  try {
    const sessRes = await axios.get(`${API}/api/sessions`, { 
      headers, 
      params: { limit: 200, sessionType: 'LMS' } 
    });
    console.log(`Sessions: ${Date.now() - sessStart}ms`);
    console.log(`Sessions count: ${sessRes.data.sessions?.length || 0}`);
    console.log(`Sessions total: ${sessRes.data.total}`);
  } catch (e) {
    console.log(`Sessions error: ${e.response?.data?.message || e.message}`);
  }
  
  // Test pickers
  console.log('\n--- Testing Picker APIs ---');
  const pickerStart = Date.now();
  try {
    const [trainers, batches, trainees] = await Promise.all([
      axios.get(`${API}/api/admin/users-by-role/trainer`, { headers }),
      axios.get(`${API}/api/admin/batches`, { headers, params: { limit: 200 } }),
      axios.get(`${API}/api/admin/users-by-role/trainee`, { headers }),
    ]);
    console.log(`Pickers: ${Date.now() - pickerStart}ms`);
    console.log(`Trainers: ${trainers.data.data?.length || 0}, Batches: ${batches.data.data?.batches?.length || 0}, Trainees: ${trainees.data.data?.length || 0}`);
  } catch (e) {
    console.log(`Pickers error: ${e.response?.data?.message || e.message}`);
  }
  
  // Test all admin users
  console.log('\n--- Testing Admin Users API ---');
  const usersStart = Date.now();
  try {
    const usersRes = await axios.get(`${API}/api/admin/users`, { 
      headers, 
      params: { role: 'trainee', limit: 'all' } 
    });
    console.log(`All trainees: ${Date.now() - usersStart}ms`);
    console.log(`Trainees count: ${usersRes.data.data?.users?.length || 0}`);
  } catch (e) {
    console.log(`Users error: ${e.response?.data?.message || e.message}`);
  }
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
