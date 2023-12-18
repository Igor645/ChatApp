const joinChatForm = document.querySelector('.joinChat');
const chatCodeInput = document.getElementById('chatCodeInput');
const joinChatButton = document.getElementById('joinChatButton');

joinChatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const chatCode = chatCodeInput.value.trim();

  if (chatCode !== '') {
    const loggedInUserString = sessionStorage.getItem('loggedInUser');
    const loggedInUser = JSON.parse(loggedInUserString);
    const loggedInUserId = loggedInUser._id;

    try {
      const response = await fetch(`${apiUrl}/api/add-user-to-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uniqPas: chatCode,
          userId: loggedInUserId,
        }),
      });

      if (response.ok) {
        console.log('User added to chat successfully');
        window.location.reload();
      } else {
        throw new Error('Failed to join chat');
      }
    } catch (error) {
      console.error('Error joining chat:', error);
    }

    chatCodeInput.value = '';
  }
});


function createChatWithRandomPassword() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const objectId = loggedInUser._id;
  
    const newChat = {
      messages: [],
      users: [objectId],
    };
  
    fetch(`${apiUrl}/api/create-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newChat),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to create chat');
      })
      .then(data => {
        console.log('Chat created successfully:', data);
        window.location.reload();
      })
      .catch(error => {
        console.error('Chat creation error:', error);
      });
  }
  
  document.querySelector('.createChat').addEventListener('click', createChatWithRandomPassword);
  