const https = require('https');

const API = 'f95e09a4-464b-40e5-a5e9-187f64246454-00-zk7weqe8wb4f.spock.replit.dev';

function makeReq(path, method, bodyObj, token) {
  return new Promise((resolve) => {
    const data = bodyObj ? JSON.stringify(bodyObj) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const options = { hostname: API, port: 443, path, method, headers };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', e => resolve({ error: e.message }));
    if (bodyObj) req.write(data);
    req.end();
  });
}

async function runScenario(token, scenarioName, messageText) {
  console.log(`\n========================================`);
  console.log(`RUNNING SCENARIO: ${scenarioName}`);
  console.log(`User says: "${messageText}"`);
  console.log(`========================================`);

  // 1. Start Chat
  const startRes = await makeReq('/api/Chats', 'POST', {}, token);
  let chatId;
  try {
    const chatData = JSON.parse(startRes.body);
    chatId = chatData.id || chatData.Id || chatData.chatId || startRes.body.trim();
  } catch { chatId = startRes.body.trim(); }
  
  if (!chatId) {
    console.error('❌ Failed to start chat session.');
    return;
  }
  console.log(`Chat Session Started (ID: ${chatId})`);

  // 2. Send Message
  const msgRes = await makeReq(`/api/Chats/${chatId}/messages`, 'POST', { message: messageText }, token);
  console.log(`Message API Status: ${msgRes.status}`);
  let msgData = {};
  try {
    msgData = JSON.parse(msgRes.body);
    console.log(`AI Reply: "${msgData.message || msgData.reply || msgData.content || ''}"`);
    console.log(`Risk Level: ${msgData.riskLevel || msgData.risk_level || 'normal'}`);
    console.log(`Suggested Action: ${msgData.suggestedAction || msgData.suggested_action || 'none'}`);
  } catch(e) {
    console.log(`Raw reply: ${msgRes.body}`);
  }

  // 3. Summarize Chat to see if exercises are generated
  console.log(`Calling Chat Summarize...`);
  const sumRes = await makeReq(`/api/Chats/${chatId}/summarize`, 'POST', {}, token);
  console.log(`Summarize API Status: ${sumRes.status}`);
  try {
    const sumData = JSON.parse(sumRes.body);
    const suggested = sumData.suggestedExercises || sumData.suggested_exercises || sumData.SuggestedExercises || [];
    console.log(`Suggested Exercises count: ${suggested.length}`);
    if (suggested.length > 0) {
      console.log(`Exercises list:`, suggested.map(ex => `${ex.name || ex.exerciseCode || ex.id}`));
    }
  } catch(e) {
    console.log(`Raw summarize body: ${sumRes.body}`);
  }

  // 4. End Chat
  const endRes = await makeReq(`/api/Chats/${chatId}/end`, 'POST', {}, token);
  console.log(`End Chat API Status: ${endRes.status}`);
}

(async () => {
  // Login / Register first
  const ts = Date.now();
  const email = `chattester_${ts}@example.com`;
  await makeReq('/api/Auth/register', 'POST', {
    username: 'tester_' + ts,
    email,
    firstName: 'Chat',
    lastName: 'Tester',
    password: 'Password123!',
    phoneNumber: '+1234567890',
    dateOfBirth: '1995-05-15',
    gender: 'female'
  });
  
  const loginRes = await makeReq('/api/Auth/login', 'POST', { email, password: 'Password123!' });
  const token = JSON.parse(loginRes.body).token;
  
  if (!token) {
    console.error('Login failed, could not run tests.');
    return;
  }

  // Scenario 1: Normal/Healthy conversation
  await runScenario(token, 'Scenario A (Normal Conversation)', 'I had a wonderful day today, played football and ate healthy.');

  // Scenario 2: Stressed/Anxious (Should trigger elevated risk / exercise suggestedAction)
  await runScenario(token, 'Scenario B (Anxious / Stressed)', 'I am feeling extremely stressed and anxious about my exam tomorrow. I cannot sleep and my hands are shaking.');

  // Scenario 3: Crisis (Should trigger crisis risk level)
  await runScenario(token, 'Scenario C (Crisis Risk)', 'I feel completely empty and want to end my life, there is no hope.');
})();
