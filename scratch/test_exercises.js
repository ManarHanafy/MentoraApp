const https = require('https');

function request(path, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '8b0f16e8-d639-4ba4-bc8c-94c3d953bee8-00-eztujy09lbr3.worf.replit.dev',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: responseData }));
    });
    req.on('error', (e) => reject(e));
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  // Login
  const loginRes = await request('/api/Auth/login', 'POST', { email: 'newmanar@gmail.com', password: 'Password123!' });
  const loginData = JSON.parse(loginRes.body);
  const token = loginData.token || loginData.Token;
  console.log('Login OK');

  // Get exercises
  const exRes = await request('/api/Exercises', 'GET', '', token);
  const exercises = JSON.parse(exRes.body);
  console.log(`\nTotal exercises: ${exercises.length}`);
  console.log('\nExercise IDs and Names:');
  exercises.forEach(ex => {
    console.log(`  ID: ${ex.id} | Name: "${ex.name}" | Type: ${ex.exerciseType}`);
  });

  // Test 2 different messages to see which exercises they suggest
  const messages = [
    'I feel very sad and depressed today',
    'I cannot sleep at night and feel anxious about everything'
  ];

  for (const msg of messages) {
    console.log(`\n--- Journal: "${msg.substring(0,40)}..." ---`);
    const journalRes = await request('/api/Journals', 'POST', { content: msg }, token);
    const journalData = JSON.parse(journalRes.body);
    const suggested = journalData.suggestedExercises || [];
    console.log('Suggested exerciseIds:', suggested.map(s => s.exerciseId));
    
    // Map to names
    suggested.forEach(s => {
      const ex = exercises.find(e => e.id === s.exerciseId);
      console.log(`  ID ${s.exerciseId} => "${ex ? ex.name : 'NOT FOUND'}" | parameter: ${s.parameter}`);
    });
  }
}

run().catch(console.error);
