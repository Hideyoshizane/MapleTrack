document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await fetchData('/userServer');

    const serverSelector = document.getElementById('serverSelector');
    const selectedServer  = document.querySelector('.selectedServer');

    let isFirstButton = true;
    const savedServerContent = getCookie('selectedServerContent');

    for (const serverID of data) {
      try {
        const serverData = await fetchData(`/serverName/${serverID}`);
        const createdButton = createServerButton(serverData);


        if(isFirstButton){
          createdSelectedButton = createdButton.cloneNode(true);
          createdSelectedButton.classList.replace('serverButton', 'SelectedButton');

          const svgElement = createdSelectedButton.querySelector('svg');
          createdSelectedButton.removeChild(svgElement);
          
          selectedServer.insertBefore(createdSelectedButton, selectedServer.firstChild);
          createdSelectedButton.classList.toggle('not-checked');

          if(savedServerContent){
            updateToCookie(selectedServer, savedServerContent);
          }
          else{
            createdSelectedButton.classList.toggle('checked');
          }
          isFirstButton = false;
        }

        if(createdButton.querySelector('span').textContent === savedServerContent){
          createdButton.classList.toggle('not-checked');
          createdButton.classList.toggle('checked');
        }

        serverSelector.appendChild(createdButton);

      } catch (error) {
        console.error('Error fetching server name:', error);
      }
    }

    const serverButtons = serverSelector.querySelectorAll('.serverButton'); 

    let selectedButton = dropdownToggle.querySelector('.SelectedButton');
    
serverButtons.forEach(serverButton => {
  serverButton.addEventListener('click', () => {
    serverButtons.forEach(button => {
      if (button !== serverButton) {
        button.classList.add('not-checked');
        button.classList.remove('checked');
      }
    });

    swapContentAndStoreCookie(selectedButton, serverButton);
    serverButton.classList.toggle('not-checked');
    serverButton.classList.toggle('checked');
  });
});
    

  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});

async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

function createServerButton(serverData) {
  const createdButton = document.createElement('button');
  createdButton.classList.add('serverButton');


  const checkSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  checkSVG.setAttribute('width', '30');
  checkSVG.setAttribute('height', '30');
  checkSVG.setAttribute('viewBox', '0 0 36 27');
  checkSVG.setAttribute('fill', 'none');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 21.4L3.59999 13L0.799988 15.8L12 27L36 2.99995L33.2 0.199951L12 21.4Z');
  path.setAttribute('fill', '#E3E3E3');


  checkSVG.appendChild(path);


  const serverImage = document.createElement('img');
  serverImage.src = `${serverData.img}.webp`;
  serverImage.alt = serverData.name;
  serverImage.classList.add('serverIcon');
  createdButton.appendChild(serverImage);

  const serverNameSpan = document.createElement('span');
  serverNameSpan.textContent = serverData.name;
  createdButton.appendChild(serverNameSpan);
  createdButton.appendChild(checkSVG);
  createdButton.classList.toggle('not-checked');
  return createdButton;

}

function swapContentAndStoreCookie(selectedButton, serverButton) {
  const selectedImage = selectedButton.querySelector('img');
  const selectedName = selectedButton.querySelector('span');

  const serverImage = serverButton.querySelector('img');
  const serverNameSpan = serverButton.querySelector('span');


  selectedImage.setAttribute('alt', serverNameSpan.textContent);
  selectedImage.src = serverImage.src;
  selectedName.textContent = serverNameSpan.textContent;

  setCookie('selectedServerContent', serverNameSpan.textContent);

}


(function setupDropdownToggle() {
  const dropdownToggle = document.querySelector('.dropdownToggle');
  const svgIcon = dropdownToggle.querySelector('.icon');
  let isOpen = false;

  dropdownToggle.addEventListener('click', function() {
    isOpen = !isOpen;
    dropdownToggle.classList.toggle('open', isOpen);
    dropdownToggle.classList.toggle('closed', !isOpen);
    svgIcon.classList.toggle('rotate', isOpen);
  });
})();




function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()}`;
}


function getCookie(name) {
  const cookieArr = document.cookie.split(';');
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=');
    if (cookiePair[0].trim() === name) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}

function updateToCookie(selectedServer, savedServerContent){
  const selectedServerImg = selectedServer.querySelector('img');
  const currentImgSrc = selectedServerImg.getAttribute('src');
  const newImgSrc = currentImgSrc.replace(/[^/]*\.webp$/, `${savedServerContent}.webp`);
  selectedServerImg.src = newImgSrc;
  selectedServerImg.setAttribute('alt', savedServerContent);
  selectedServer.querySelector('span').textContent = savedServerContent;

}


const filterButtons = document.querySelectorAll('.FilterButton');
const savedFilterValues = getCookie('filterValues');
const filterCookies = savedFilterValues ? savedFilterValues.split(',') : [];

// Load filter values from cookies
filterButtons.forEach(button => {
    const dataValue = button.getAttribute('data-value');
    if (filterCookies.includes(dataValue))
        button.classList.add('selected');
});

// Filter Button logic
const selectedValues = filterCookies.slice();

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('selected');
        
        const dataValue = button.getAttribute('data-value');
        if (button.classList.contains('selected')) {
            if (!selectedValues.includes(dataValue)) {
                selectedValues.push(dataValue);
            }
        } else {
            const dataIndex = selectedValues.indexOf(dataValue);
            if (dataIndex !== -1) {
                selectedValues.splice(dataIndex, 1);
            }
        }
        
        updateSelectedValuesCookie();
    });
});

function updateSelectedValuesCookie() {
    const selectedValuesString = selectedValues.join(',');
    setCookie('filterValues', selectedValuesString, 7);
}