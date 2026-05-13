const https = require('https');

const API_BASE = 'https://8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev/api';

async function getAuthToken() {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' });
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };
    const req = https.request(`${API_BASE}/Auth/login`, options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => { try { resolve(JSON.parse(body).token); } catch (e) { resolve(''); } });
    });
    req.on('error', () => resolve(''));
    req.write(data);
    req.end();
  });
}

async function run() {
  const token = await getAuthToken();
  const options = { headers: { 'Authorization': `Bearer ${token}` } };
  https.get(`${API_BASE}/Exercises`, options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const codes = [...new Set(json.map(x => x.exerciseCode))];
        console.log('Unique Codes:', JSON.stringify(codes, null, 2));
      } catch (e) { console.log('Error:', e.message); }
    });
  });
}

run();
