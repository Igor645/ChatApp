// Check if the user is logged in
const user = sessionStorage.getItem('loggedInUser');

// Select relevant DOM elements
const loginRelatedDiv = document.querySelector('.loginRelated');
const chatManagerDiv = document.querySelector('.chatManager');

if (user) {
    console.log(user)
    const loggedInUser = JSON.parse(user);
    const username = loggedInUser.Username; // Replace 'username' with the correct property name

    const usernameElement = document.createElement('span');
    usernameElement.textContent = `Welcome, ${username}`;
    usernameElement.classList.add('usernameDisplay'); // Add a class to the username element
    
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.classList.add('logout-btn'); // Add a class to the logout button
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('loggedInUser');
        window.location.reload();
    });
    
    // Clear existing content and append new elements
    loginRelatedDiv.innerHTML = '';
    loginRelatedDiv.appendChild(usernameElement);
    loginRelatedDiv.appendChild(logoutButton);    

    // Show the chat manager
    chatManagerDiv.style.display = 'flex';
} else {
    // If the user is not logged in, hide the chat manager
    chatManagerDiv.style.display = 'none';
}