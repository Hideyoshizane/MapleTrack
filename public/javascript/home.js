document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/userServer');
    const data = await response.json();

    const serverSelector = document.getElementById('serverSelector');
    const dropdownToggle = document.querySelector('.selectedServer');
    let isFirstButton = true;

    for (const serverID of data) {
      try {
        const idAnswer = await fetch(`/serverName/${serverID}`);
        const serverData = await idAnswer.json();

        const serverButton = document.createElement('button');
        if(isFirstButton){
          serverButton.classList.add('SelectedButton'); 
        }
        else{
          serverButton.classList.add('serverButton');
        } 

        const serverImage = document.createElement('img');
        serverImage.src = `${serverData.img}.webp`;
        serverImage.alt = serverData.name;
        serverImage.classList.add('serverIcon');
        serverButton.appendChild(serverImage);

        const serverNameSpan = document.createElement('span');
        serverNameSpan.textContent = serverData.name;
        serverButton.appendChild(serverNameSpan);
        if (isFirstButton) {
          dropdownToggle.insertBefore(serverButton, dropdownToggle.firstChild);
          isFirstButton = false;
        } else {
          serverSelector.appendChild(serverButton);
        }

      } catch (error) {
        console.error('Error fetching server name:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});

(function() {
  const dropdownToggle = document.querySelector('.dropdownToggle');
  const svgIcon = dropdownToggle.querySelector('.icon'); // Replace with correct selector
  let isOpen = false;

  dropdownToggle.addEventListener('click', function() {
    if (isOpen) {
      dropdownToggle.classList.remove('open');
      dropdownToggle.classList.add('closed');
      svgIcon.classList.remove('rotate');
    } else {
      dropdownToggle.classList.remove('closed');
      dropdownToggle.classList.add('open');
      svgIcon.classList.add('rotate');
    }
    isOpen = !isOpen;
  });
})();
