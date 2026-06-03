const API_BASE_URL = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api';

async function testInsomnia() {
  const email = `test_ins_${Date.now()}@example.com`;
  const password = 'Password123!';
  const username = `test_ins_${Date.now()}`;
  
  console.log('Registering user...');
  await fetch(`${API_BASE_URL}/Auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      firstName: 'Test',
      lastName: 'Insomnia',
      password,
      phoneNumber: '12345678',
      dateOfBirth: '2000-01-01',
      gender: 'Male'
    })
  });

  console.log('Logging in...');
  const loginRes = await fetch(`${API_BASE_URL}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!loginRes.ok) {
     console.error('Login failed, cannot test.');
     return;
  }
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  console.log('Sending "عندي أرق" to Journals API...');
  const res = await fetch(`${API_BASE_URL}/Journals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ journal_text: 'عندي أرق' })
  });
  
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('API response keys:', Object.keys(data));
  console.log('risk_level / riskLevel:', data.risk_level || data.riskLevel || data.RiskLevel);
  console.log('Full response:');
  console.log(JSON.stringify(data, null, 2));
}

testInsomnia();
