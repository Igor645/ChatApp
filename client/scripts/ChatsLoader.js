const apiUrl = 'https://chatapi-uax3.onrender.com';
const storedUser = sessionStorage.getItem('loggedInUser');
let loadedMessageIds = new Set();
window.onload = function() {
  sessionStorage.setItem('chosenChat', '');
};


if (storedUser) {
  const loggedInUser = JSON.parse(storedUser);

  const objectId = loggedInUser._id;
  console.log(objectId)

  const socket = new WebSocket('wss://chatapi-uax3.onrender.com'); 

socket.onopen = function(event) {
  console.log('WebSocket connection established');
};

socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'newMessage') {
    fetchNewMessagesAndUpdateUI();
  }
};

fetch(`${apiUrl}/api/chats/${objectId}`)
.then(response => {
  if (response.ok) {
    return response.json();
  }
  throw new Error('Failed to fetch chats');
})
.then(chats => {
  console.log(chats)
  const chatPicker = document.querySelector('.chatPicker');

  chats.forEach(chat => {
    const chatBox = document.createElement('div');
    chatBox.classList.add('chatBox');

    fetch(`${apiUrl}/api/chat-users/${chat._id}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to fetch chat users');
      })
      .then(data => {
        console.log(data)
        const usernames = data.users.map(user => user.Username).join(', ');
        const chatTitle = document.createElement('div');
        chatTitle.classList.add('chatTitle');
        chatTitle.textContent = usernames;
        chatBox.dataset.id = chat._id;
        chatBox.appendChild(chatTitle);
        fetch(`${apiUrl}/api/chat-messages/${chat._id}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to fetch chat messages');
        })
        .then(data => {
          const chatPreview = document.createElement('div');
          chatPreview.classList.add('chatPreview');
          if (data.messages.length > 0) {
            const lastMessage = data.messages[data.messages.length - 1];
            chatPreview.textContent = lastMessage.Nachricht;
          } else {
            chatPreview.textContent = 'No messages yet';
          }
      
          chatBox.appendChild(chatPreview);
          renderMessages(chatBox, data.messages, chat);
          chatPicker.appendChild(chatBox);
        })
        .catch(error => {
          console.error('Chat messages fetch error:', error);
        });
        
      })
      .catch(error => {
        console.error('Chat users fetch error:', error);
      });

  });
})
.catch(error => {
  console.error('Chats fetch error:', error);
});

} else {
  console.log('No loggedInUser data found in sessionStorage');
}

function renderMessages(chatBoxElement, messages, chat) {
  chatBoxElement.addEventListener('click', function() {
    pauseSynchronizeChat(() => {
      loadedMessageIds = new Set();
      const msgContainer = document.querySelector(".msgContainer");
      msgContainer.innerHTML = "";
      const chosenChatId = this.dataset.id;
      sessionStorage.setItem('chosenChat', chosenChatId);
      
      const chatTitles = document.querySelectorAll(".chatTitle");
      
      chatTitles.forEach(title => {
        title.classList.remove('selected');
      });

      this.querySelector('.chatTitle').classList.add('selected');

      const currentCode = document.querySelector('.currentCode');
      currentCode.textContent = chat.uniqPas;

      chatContainer.scrollTop = chatContainer.scrollHeight;
      fetchNewMessagesAndUpdateUI();
    })
  });
}


function fetchNewMessagesAndUpdateUI() {
  const serializedSet = JSON.stringify(Array.from(loadedMessageIds));
  fetch(`${apiUrl}/api/synchronize-messages/${sessionStorage.getItem("chosenChat")}/${serializedSet}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to fetch chat messages');
    })
    .then(data => {    
      const loggedInUserString = sessionStorage.getItem('loggedInUser');
      const loggedInUser = JSON.parse(loggedInUserString);
      const loggedInUserId = loggedInUser._id;
      const msgContainer = document.querySelector(".msgContainer");

      data.messages.forEach(message => {
        if (!loadedMessageIds.has(message._id)) {
          const messageContainer = document.createElement('div');
          messageContainer.classList.add('message-container');

          
          const msgDiv = document.createElement('div');
          msgDiv.textContent = message.Nachricht;
          
          if (message.UserId === loggedInUserId) {
            msgDiv.classList.add('yourMsg');
          } else {
            msgDiv.classList.add('otherMsg');
            const usernameDiv = document.createElement('div');
            usernameDiv.textContent = message.Username;
            usernameDiv.classList.add('otherUsername');
            messageContainer.appendChild(usernameDiv);
          }

          messageContainer.appendChild(msgDiv);

          loadedMessageIds.add(message._id);
          msgContainer.appendChild(messageContainer);
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      });
    })
    .catch(error => {
      console.error('Chat messages fetch error:', error);
    });
}



let syncIntervalId;

function startSynchronizeChat() {
  syncIntervalId = setInterval(synchronizeChat, 300);
}

function pauseSynchronizeChat(callback) {
  clearInterval(syncIntervalId);
  setTimeout(callback, 300);
}

