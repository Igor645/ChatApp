const registerForm = document.getElementById('registerForm');
const apiUrl = 'https://chatapi-uax3.onrender.com';

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const fullName = firstName + ' ' + lastName;
    const email = document.getElementById('email').value;
    const password = document.getElementById('registerPassword').value;

    const formData = {
    Username: fullName,
    Email: email,
    Password: password
    };

    try {
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
    console.error('Registration error:', error);
    }
});
