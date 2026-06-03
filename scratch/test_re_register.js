const API_BASE_URL = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api';

async function testReRegister() {
  const email = `test_re_reg_${Date.now()}@example.com`;
  const password = 'Password123!';
  const username = `test_re_reg_${Date.now()}`;
  
  console.log('Registering user first time...');
  let registerRes1 = await fetch(`${API_BASE_URL}/Auth/register`, {
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
  console.log('Register 1 status:', registerRes1.status);
  
  console.log('Logging in...');
  const loginRes = await fetch(`${API_BASE_URL}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  console.log('Deleting account...');
  const deleteRes = await fetch(`${API_BASE_URL}/Account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  console.log('Delete status:', deleteRes.status);

  console.log('Registering user second time with same email/username...');
  let registerRes2 = await fetch(`${API_BASE_URL}/Auth/register`, {
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
  console.log('Register 2 status:', registerRes2.status);
  if (registerRes2.ok) {
    console.log('Success! Registering with the same credentials after deletion is allowed.');
  } else {
    const text = await registerRes2.text();
    console.log('Register 2 failed with body:', text);
  }
}

testReRegister();
