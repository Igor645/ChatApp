const registerForm = document.getElementById('registerForm');
const apiUrl = 'http://localhost:3000';

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const fullName = firstName + ' ' + lastName;
    const email = document.getElementById('email').value;
    const password = document.getElementById('registerPassword').value;

    // Create an object with the form data
    const formData = {
    Username: fullName,
    Email: email,
    Password: password
    };

    try {
    // Send form data to the server using fetch or any other method (AJAX, Axios, etc.)
    const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        throw new Error('Failed to register');
    }

    console.log('Registration successful!');
    window.location.href = '../html/login.html';
    } catch (error) {
    // Handle errors during registration
    console.error('Registration error:', error);
    }
});
