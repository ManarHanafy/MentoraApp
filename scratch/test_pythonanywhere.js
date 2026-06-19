const https = require('https');

const data = JSON.stringify({
  journal_text: 'عندي ارق',
  current_scores: {
    ANX: 5,
    DEP: 5,
    STR: 5,
    SLP: 5,
    SOC: 5,
    CDT: 5,
    SAFE: 5,
    ENG: 5
  }
});

const options = {
  hostname: 'mentorrra.pythonanywhere.com',
  port: 443,
  path: '/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log('BODY===');
    console.log(body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
