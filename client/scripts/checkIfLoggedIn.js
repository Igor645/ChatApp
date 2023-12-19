const user = sessionStorage.getItem('loggedInUser');

const loginRelatedDiv = document.querySelector('.loginRelated');
const chatManagerDiv = document.querySelector('.chatManager');

if (user) {
    console.log(user)
    const loggedInUser = JSON.parse(user);
    const username = loggedInUser.Username;

    const usernameElement = document.createElement('span');
    usernameElement.textContent = `Welcome, ${username}`;
    usernameElement.classList.add('usernameDisplay'); 
    
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.classList.add('logout-btn'); 
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('loggedInUser');
        window.location.reload();
    });
    
    loginRelatedDiv.innerHTML = '';
    loginRelatedDiv.appendChild(usernameElement);
    loginRelatedDiv.appendChild(logoutButton);    

    chatManagerDiv.style.display = 'flex';
} else {
    chatManagerDiv.style.display = 'none';
}