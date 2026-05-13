const https = require('https');

async function getResponse() {
  const data = JSON.stringify({
    journal_text: 'أشعر بالكثير من التوتر والقلق اليوم بسبب العمل'
  });

  // Login first to get token
  const authData = JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' });
  
  const loginOptions = {
    hostname: '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev',
    port: 443,
    path: '/api/Auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': authData.length
    }
  };

  const token = await new Promise((resolve) => {
    const req = https.request(loginOptions, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed.token || parsed.Token);
        } catch(e) { resolve(null); }
      });
    });
    req.write(authData);
    req.end();
  });

  if (!token) {
    console.log('Login failed');
    return;
  }

  const options = {
    hostname: '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev',
    port: 443,
    path: '/api/Journals',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${token}`
    }
  };

  const req = https.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('RESULT_START');
      console.log(body);
      console.log('RESULT_END');
    });
  });

  req.on('error', error => console.error(error));
  req.write(data);
  req.end();
}

getResponse();
