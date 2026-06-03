const API_BASE_URL = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api';

async function getOnboarding() {
  const email = `test_onb_${Date.now()}@example.com`;
  const password = 'Password123!';
  const username = `test_onb_${Date.now()}`;
  
  console.log('Registering test user...');
  await fetch(`${API_BASE_URL}/Auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      firstName: 'Test',
      lastName: 'Onboarding',
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
  const loginData = await loginRes.json();
  const token = loginData.token;

  console.log('Fetching onboarding questions...');
  const res = await fetch(`${API_BASE_URL}/Onboarding/questions`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  const data = await res.json();
  console.log('Questions length:', data.questions ? data.questions.length : 0);
  if (data.questions) {
    const q9 = data.questions.find(q => q.questionId === 9 || q.id === 9);
    console.log('Question 9 details:');
    console.log(JSON.stringify(q9, null, 2));
    
    console.log('All questions with multiple choice details:');
    data.questions.forEach((q, idx) => {
       console.log(`Step ${idx + 1} (QID: ${q.questionId}): text="${q.questionText}" maxAllowedSelections=${q.maxAllowedSelections} type=${q.inputControlType}`);
    });
  }
}

getOnboarding();
