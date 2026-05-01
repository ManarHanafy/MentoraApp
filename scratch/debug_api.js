const https = require('https');

async function getResponse() {
  const data = JSON.stringify({
    content: 'أشعر بالكثير من التوتر والقلق اليوم بسبب العمل'
  });

  // Login first to get token
  const authData = JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' });
  
  const loginOptions = {
    hostname: '7a062fd9-ca89-4384-9cc3-2d5708ee1ab9-00-1mhj59pmn7qzz.janeway.replit.dev',
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
    hostname: '7a062fd9-ca89-4384-9cc3-2d5708ee1ab9-00-1mhj59pmn7qzz.janeway.replit.dev',
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
