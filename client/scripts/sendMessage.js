const chatInput = document.querySelector('.chatInput');

chatInput.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    const messageContent = chatInput.value.trim();

    if (messageContent !== '') {
      const loggedInUserString = sessionStorage.getItem('loggedInUser');
      const loggedInUser = JSON.parse(loggedInUserString);
      const loggedInUserId = loggedInUser._id;
      
      const chatId = sessionStorage.getItem('chosenChat');

      try {
        const response = await fetch(`${apiUrl}/api/add-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: chatId,
            userId: loggedInUserId,
            content: messageContent
          })
        });

        if (response.ok) {

          } else {
            throw new Error('Failed to add message');
          }
                
      } catch (error) {
        console.error('Error adding message:', error);
        // Handle error cases if needed
      }

      chatInput.value = ''; // Clear the input after sending the message
    }
  }
});
