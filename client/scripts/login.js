const loginForm = document.getElementById('loginForm');
const apiUrl = 'http://localhost:3000';

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); 

  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const loginData = {
    Email: email,
    Password: password
  };

  try {
    const response = await fetch(`${apiUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    const loginResponse = await response.json();
    console.log('Login successful!', loginResponse);

    if (loginResponse && loginResponse.user) {
      sessionStorage.setItem('loggedInUser', JSON.stringify(loginResponse.user));
    }

    window.location.href = '../html/index.html';
  } catch (error) {
    console.error('Login error:', error);
  }
});
