const http = require('http');
const fs = require('fs');
const TOKEN = fs.readFileSync('C:/Users/Admin/AppData/Local/Temp/trainee_token.txt', 'utf8');
const ADMIN_TOKEN = fs.readFileSync('C:/Users/Admin/AppData/Local/Temp/admin_token.txt', 'utf8');
const TRAINER_TOKEN = fs.readFileSync('C:/Users/Admin/AppData/Local/Temp/trainer_token.txt', 'utf8');

const sessionId = '6a7af94e316e1d8fdae51738';
const workshopId = '6a7af504316e1d8fdae5151f';

function api(path, method, body, token) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'localhost', port: 8080, path, method, timeout: 8000,
      headers: { Authorization: 'Bearer ' + token }
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(opts, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, data: JSON.parse(d) }); }
        catch(e) { resolve({ status: r.statusCode, data: d }); }
      });
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  // 1. Trainee: Get completed workshop sessions
  const r1 = await api('/api/trainee/workshop-sessions?status=completed', 'GET', null, TOKEN);
  console.log('1. Trainee sessions:', r1.status, r1.data?.success, 'count:', r1.data?.sessions?.length || 0);
  const completed = (r1.data?.sessions || []).filter(s => s.status === 'completed');
  console.log('   Completed:', completed.length, completed.map(s => s._id));

  // 2. Trainee: Submit feedback
  const feedbackPayload = JSON.stringify({
    sessionId, workshopId,
    overallRating: 5, trainerRating: 4, contentRating: 5, audioRating: 4, videoRating: 5,
    comment: 'Excellent workshop!', suggestions: 'Add more examples.'
  });
  const r2 = await api('/api/trainee/workshop-feedback', 'POST', feedbackPayload, TOKEN);
  console.log('2. Submit feedback:', r2.status, r2.data?.success, r2.data?.message || r2.data?.message || '');
  console.log('   Feedback ID:', r2.data?.feedback?._id);

  // 3. Trainee: Get submitted feedback
  const r3 = await api('/api/trainee/workshop-feedback', 'GET', null, TOKEN);
  console.log('3. Trainee feedback list:', r3.status, r3.data?.success, 'count:', r3.data?.feedback?.length || 0);
  if (r3.data?.feedback?.[0]) {
    const f = r3.data.feedback[0];
    console.log('   Sample:', JSON.stringify({workshop: f.workshopId?.title, rating: f.rating, comment: f.comment}));
  }

  // 4. Admin: View workshop feedback
  const r4 = await api('/api/admin/workshops/feedback?limit=20', 'GET', null, ADMIN_TOKEN);
  console.log('4. Admin feedback:', r4.status, r4.data?.success, 'count:', r4.data?.feedback?.length || 0);
  if (r4.data?.feedback?.[0]) {
    const f = r4.data.feedback[0];
    console.log('   Admin sees:', JSON.stringify({student: f.studentId?.name, workshop: f.workshopId?.title, rating: f.rating}));
  }

  // 5. Trainer: View feedback for workshop
  const r5 = await api('/api/trainer/workshops/' + workshopId + '/feedback', 'GET', null, TRAINER_TOKEN);
  console.log('5. Trainer feedback:', r5.status, r5.data?.success, 'count:', r5.data?.feedback?.length || 0);
  console.log('   Stats:', JSON.stringify(r5.data?.stats || {}));

  // 6. Verify duplicate submission is blocked
  const r6 = await api('/api/trainee/workshop-feedback', 'POST', feedbackPayload, TOKEN);
  console.log('6. Duplicate feedback:', r6.status, r6.data?.success, r6.data?.message || '');
})();
