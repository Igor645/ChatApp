const loginForm = document.getElementById('loginForm');
const apiUrl = 'http://localhost:3000';

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  // Get form data
  const email = document.getElementById('username').value; // Assuming 'username' is used for email
  const password = document.getElementById('password').value;

  // Create an object with the login data
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

    // If login is successful, parse the response JSON
    const loginResponse = await response.json();
    console.log('Login successful!', loginResponse);

    // Save user data to session storage
    if (loginResponse && loginResponse.user) {
      sessionStorage.setItem('loggedInUser', JSON.stringify(loginResponse.user));
    }

    // Redirect to the index.html page or perform other actions
    window.location.href = '../html/index.html';
  } catch (error) {
    // Handle errors during login
    console.error('Login error:', error);
    // Show an error message to the user if needed
  }
});
