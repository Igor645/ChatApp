const chatContainer = document.querySelector('.msgContainer');

chatContainer.scrollTop = chatContainer.scrollHeight;

const chatManager = document.querySelector('.chatManager');
const moveManagerButton = document.querySelector('.moveManager');

let isMovedDown = false;

moveManagerButton.addEventListener('click', () => {
  if (!isMovedDown) {
    chatManager.style.transform = 'translateY(0)';
    document.querySelector(".moveManager").innerHTML = "&blacktriangle;"
  } else {
    chatManager.style.transform = 'translateY(-27vh)';
    document.querySelector(".moveManager").innerHTML = "&blacktriangledown;"
  }

  isMovedDown = !isMovedDown;
});

