const API_BASE_URL = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api';

async function test() {
  const email = `test_del_${Date.now()}@example.com`;
  const password = 'Password123!';
  const username = `test_del_${Date.now()}`;
  
  console.log('Registering user...');
  let registerRes;
  try {
    registerRes = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        firstName: 'Test',
        lastName: 'Delete',
        password,
        phoneNumber: '12345678',
        dateOfBirth: '2000-01-01',
        gender: 'Male'
      })
    });
  } catch (err) {
    console.error('Registration failed directly, trying fallback /Users...', err.message);
    registerRes = await fetch(`${API_BASE_URL}/Users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        firstName: 'Test',
        lastName: 'Delete',
        password,
        phoneNumber: '12345678',
        dateOfBirth: '2000-01-01',
        gender: 'Male'
      })
    });
  }

  const registerData = await registerRes.json();
  console.log('Register response status:', registerRes.status);
  
  console.log('Logging in to get token...');
  const loginRes = await fetch(`${API_BASE_URL}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('Login status:', loginRes.status);
  if (!loginRes.ok) {
    console.error('Login failed');
    return;
  }
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Token obtained');

  const testEndpoints = [
    { method: 'DELETE', path: '/Users' },
    { method: 'DELETE', path: '/Users/me' },
    { method: 'DELETE', path: `/Users/${username}` },
    { method: 'DELETE', path: '/Auth/delete-account' },
    { method: 'POST', path: '/Auth/delete-account' },
    { method: 'POST', path: '/Users/delete' },
    { method: 'DELETE', path: '/Users/delete-account' },
    { method: 'DELETE', path: '/Auth/delete' },
    { method: 'DELETE', path: '/Auth' },
  ];

  for (const ep of testEndpoints) {
    try {
      console.log(`Testing ${ep.method} ${ep.path}...`);
      const res = await fetch(`${API_BASE_URL}${ep.path}`, {
        method: ep.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Status: ${res.status}`);
      if (res.status === 200 || res.status === 204 || res.status === 202) {
        console.log(`SUCCESS! Endpoint ${ep.method} ${ep.path} works.`);
        try {
          const body = await res.text();
          console.log('Response body:', body);
        } catch {}
        return;
      }
    } catch (e) {
      console.log(`Error testing ${ep.path}:`, e.message);
    }
  }
  console.log('Finished testing endpoints.');
}

test();
