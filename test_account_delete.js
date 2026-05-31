const API_BASE_URL = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api';

async function testDeleteAccount() {
  const email = `test_del_${Date.now()}@example.com`;
  const password = 'Password123!';
  const username = `test_del_${Date.now()}`;
  
  console.log('Registering user...');
  let registerRes = await fetch(`${API_BASE_URL}/Auth/register`, {
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
  console.log('Register status:', registerRes.status);
  
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

  console.log('Deleting account via DELETE /Account...');
  const deleteRes = await fetch(`${API_BASE_URL}/Account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  console.log('Delete status:', deleteRes.status);
  try {
    const text = await deleteRes.text();
    console.log('Delete body:', text);
  } catch(e) {}

  console.log('Trying to login again to verify account deletion...');
  const reLoginRes = await fetch(`${API_BASE_URL}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('Re-login status (should fail):', reLoginRes.status);
  try {
    const text = await reLoginRes.text();
    console.log('Re-login body:', text);
  } catch(e) {}
}

testDeleteAccount();
