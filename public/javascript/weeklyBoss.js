window.bossList;
window.server;
window.selectedList;
window.username;

document.addEventListener('DOMContentLoaded', async () => {
    server = getCookie('selectedServerContent');
    await fetchBossList();
    await loadPage();

  const button = document.querySelector('.teste');
  button.addEventListener('click', async () =>{
    const placeholder = {
      value: 10000000000,
      server: server,
      username: username
    };
    fetch('/checkBoss', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(placeholder),
    }).catch((error) => {
      console.error('Error:', error);
    });
    updateTopButtons();
  });
  
  setupServerDropdownToggle();

  const serverButtons = document.querySelectorAll('.serverButton'); 
    
    serverButtons.forEach(serverButton => {
      serverButton.addEventListener('click', async () => {
        await handleServerButtonClick(serverButton, serverButtons);
      });
    });

  const editButton = document.querySelector('.editButton');
  editButton.addEventListener('click', async () => {
    console.log('hi');
  });

})

async function fetchBossList(){
  try {
    username = document.getElementById("userdata").getAttribute('data-username');
  
    const response =  await fetch(`/bossList/${username}`);
    bossList = await response.json();

    selectedList = bossList.server;
    selectedList = selectedList.find(servers => servers.name === server);

  } catch (error) {
    console.error('Error fetching character data:', error);
  }
}

function createDOMElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
  
    if (className) {
      element.classList.add(className);
    }
  
    if (content !== '') {
      element.textContent = content;
    }
  
    return element;
  }

  async function createImageElement(src, alt, className = '') {
    const image = createDOMElement('img', className);
    image.src = src;
    image.alt = alt;
  
    await image.decode();
    return image;
  }

async function loadPage(){
    await loadTopButtons();
    await loadCharacterCards();
}

async function loadTopButtons(){
    await createBossingLogo();
    await createWeekProgress();
    await createTotalGain();
    await createAllServerButton();
    await createEditBossesButton();
}

async function createBossingLogo(){
    const parentDiv = document.querySelector('.topButtons');

    const bossDiv = createDOMElement('div', 'bossDiv');
    
    const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
    const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');

    const bossSpan = createDOMElement('span', 'bossHunting', 'Boss Hunting');

    bossDiv.appendChild(bossIcon);
    bossDiv.appendChild(bossSpan);

    parentDiv.appendChild(bossDiv);
}

async function loadEditableSVGFile(filePath, className) {
    try {
      const response = await fetch(filePath);
      const svgData = await response.text();
  
      const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
     
      svgElement.innerHTML = svgData;
  
      if (className) {
        svgElement.classList.add(className);
      }
  
      const pathElements = svgElement.querySelectorAll("path");

      pathElements.forEach((path) => {
        path.setAttribute("fill", '#3D3D3D');
      });
      
      return svgElement;
  
    } catch (error) {
      console.error("Error loading SVG file:", error);
      return null;
    }
  }

async function createWeekProgress(){
    const parentDiv = document.querySelector('.topButtons');
    const WeekProgressDiv = createDOMElement('div', 'WeekProgressDiv');
    const crystal = await createImageElement(`../../public/assets/icons/menu/crystal.webp`,'Boss Crystal Icon', 'crystalIcon');

    const WeekProgress = createDOMElement('span','weekProgress', 'Week Progress');
    const totalProgress = createDOMElement('span','totalProgress', `${selectedList.weeklyBosses}/180`);
    const progressBar = createProgressBar(selectedList.weeklyBosses);

    const textDiv = createDOMElement('div', 'WeekTextDiv');

    WeekProgressDiv.appendChild(crystal);
    textDiv.appendChild(WeekProgress);
    textDiv.appendChild(totalProgress);
    textDiv.appendChild(progressBar);
    WeekProgressDiv.appendChild(textDiv);
    parentDiv.appendChild(WeekProgressDiv);
}


function createProgressBar(current) {
  const maxWidth = 227;
  const total = 180;
	const outerDiv = createDOMElement('div', 'OuterEXPBar');
	outerDiv.style.width = `${maxWidth}px`;
	outerDiv.style.height = '16px';

	const innerDiv = createDOMElement('div', 'InnerEXPBar');
	innerDiv.style.height = '12px';
	let barSize = (current / total) * maxWidth;
	if (current == 180) {
    barSize = maxWidth - 4;
    innerDiv.style.backgroundColor = '#48AA39'; 
  }

 	innerDiv.style.width = `${barSize}px`;
	outerDiv.appendChild(innerDiv);
	return outerDiv;
  }

async function createTotalGain(){
  const parentDiv = document.querySelector('.topButtons');
  const Gold = await createImageElement(`../../public/assets/icons/menu/gold.webp`,'Gold Icon', 'goldIcon');
  const GoldtextDiv = createDOMElement('div', 'GoldTextDiv');

  const totalGainText = createDOMElement('span', 'totalGainText', 'Total Gain');
  const GainValue = `${selectedList.totalGains.toLocaleString('en-US')}`;
  const totalGainValue = createDOMElement('span','totalGoldValue', GainValue);
  const fontSize = await adjustFontSizeToFit(GainValue);
  totalGainValue.style.fontSize = fontSize + 'px';

  GoldtextDiv.appendChild(totalGainText);
  GoldtextDiv.appendChild(totalGainValue);
  const totalGainDiv = createDOMElement('div', 'totalGainDiv');
  totalGainDiv.appendChild(Gold);
  totalGainDiv.appendChild(GoldtextDiv);
  parentDiv.appendChild(totalGainDiv);
}

async function adjustFontSizeToFit(totalGainValue) {
  const maxWidth = 265;
  const originalFontSize = 32;

  const copy = document.createElement('span');
  copy.textContent = totalGainValue;
  copy.style.fontSize = originalFontSize + 'px';
  copy.style.fontFamily = 'Inter';

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';

  container.appendChild(copy);
  document.body.appendChild(container);

  let width = copy.offsetWidth;
  let fontSize = originalFontSize;
  while (width > maxWidth && fontSize > 0) {
    fontSize -= 1;
    copy.style.fontSize = fontSize + 'px';
    width = copy.offsetWidth;
  }
  document.body.removeChild(container);
  return fontSize;
}


async function createAllServerButton() {
	const parentDiv = document.querySelector('.topButtons');
  const dropdownToggle = createDOMElement('button', 'dropdownToggle');
  dropdownToggle.id = 'dropdownToggle';

  const selectedServer = createDOMElement('div', 'selectedServer');
  const arrowSVG = await createArrowSVG();
  const serverSelector = createDOMElement('div', 'serverSelector');

  selectedServer.appendChild(arrowSVG);

  let isFirstButton = true;

  try{
    const data = await fetch('/userServer').then(response => response.json());
    const serverDataPromises = data.map(async (serverID) => {
      const response = await fetch(`/serverName/${serverID}`);
      return response.json();
    });

    const serverDataArray = await Promise.all(serverDataPromises);
    const fragment = document.createDocumentFragment();

    for(servers of serverDataArray) {
      const createdButton = await createServerButton(servers);
      if(isFirstButton){
        createdSelectedButton = createdButton.cloneNode(true);
        createdSelectedButton.classList.replace('serverButton', 'SelectedButton');

        const svgElement = createdSelectedButton.querySelector('svg');
        createdSelectedButton.removeChild(svgElement);
        
        selectedServer.insertBefore(createdSelectedButton, selectedServer.firstChild);
        createdSelectedButton.classList.toggle('not-checked');

        if(server){
          updateToCookie(selectedServer, server);
        }
        else{
          createdSelectedButton.classList.toggle('checked');
        }
        isFirstButton = false;
      }

      if(createdButton.querySelector('span').textContent === server){
        createdButton.classList.toggle('not-checked');
        createdButton.classList.toggle('checked');
      }
      fragment.appendChild(createdButton);
      serverSelector.appendChild(fragment);

    }

  } catch(error){
    console.error(error);
  };

  const dropdown = createDOMElement('div', 'dropdown');
  dropdownToggle.appendChild(selectedServer);
  dropdownToggle.appendChild(serverSelector);
  dropdown.appendChild(dropdownToggle);
  parentDiv.appendChild(dropdown);
}

async function createArrowSVG() {
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("id", "icon");
  svgElement.setAttribute("width", "30px");
  svgElement.setAttribute("height", "30px");
  svgElement.setAttribute("viewBox", "0 0 1024 1024");
  svgElement.setAttribute("class", "icon");

  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElement.setAttribute("d", "M917.333333 364.8L851.2 298.666667 512 637.866667 172.8 298.666667 106.666667 364.8 512 768z");
  pathElement.setAttribute("fill", "#F6F6F6");
  svgElement.appendChild(pathElement);
  return svgElement;
}

async function createServerButton(serverData) {

  const createdButton = createDOMElement('button', 'serverButton');
  const serverImage = await createImageElement(`${serverData.img}.webp`, serverData.name, 'serverIcon');
  const serverNameSpan = createDOMElement('span', '', serverData.name);
  const checkSVG = createCheckSVG();

  createdButton.appendChild(serverImage);
  createdButton.appendChild(serverNameSpan);
  createdButton.appendChild(checkSVG);

  createdButton.classList.toggle('not-checked');

  return createdButton;

}

function createCheckSVG(){
  const checkSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  checkSVG.setAttribute('width', '30');
  checkSVG.setAttribute('height', '30');
  checkSVG.setAttribute('viewBox', '0 0 36 27');
  checkSVG.setAttribute('fill', 'none');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 21.4L3.59999 13L0.799988 15.8L12 27L36 2.99995L33.2 0.199951L12 21.4Z');
  path.setAttribute('fill', '#E3E3E3');

  checkSVG.appendChild(path);
  return checkSVG;
}

async function createEditBossesButton(){
  const parentDiv = document.querySelector('.topButtons');
  const editButton = createDOMElement('button', 'editButton', 'Edit bosses');

  parentDiv.appendChild(editButton);
}
  
async function loadCharacterCards(){
  const parentDiv = document.querySelector('.characters');
  for(characters of selectedList.characters){
    characterButton = createDOMElement('button', 'characterButton');

    const imgSource = `../../public/assets/buttom_profile/${characters.code}.webp`;
    characterImage = await createImageElement(imgSource, 'character Profile', 'profile');

    characterName = createDOMElement('span', 'characterName',`${characters.name}`);
    characterClass = createDOMElement('span', 'characterClass', `${characters.class}`);

    characterWrapper = createDOMElement('div', 'characterWrapper');
  
    characterWrapper.appendChild(characterName);
    characterWrapper.appendChild(characterClass);

    characterButton.appendChild(characterImage);
    characterButton.appendChild(characterWrapper);

    let totalChecks = 0;
    if(characters.bosses.length > 0){
      for(bosses of character.bosses){
        if(bosses.checked == true){
          totalChecks += 1;
        }
      }
    }

    let checks;
    
    if(totalChecks == characters.bosses.length){
      characterButton.style.backgroundColor = "#9EE493";
      checks = await createCheckMark();
    }
    else{
      characterButton.style.backgroundColor = "#D7D7D7";
      checks = createDOMElement('span', 'checks', `${totalChecks}/${characters.bosses.length}`);
    }
    characterButton.appendChild(checks);

    const arrowSVG = await createArrowSVG();
    arrowSVG.querySelector('path').setAttribute('fill', '#3D3D3D');
    
    characterButton.appendChild(arrowSVG);

    parentDiv.appendChild(characterButton);
  }
}
async function createCheckMark(){
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "40");
  svg.setAttribute("height", "40");
  svg.setAttribute("viewBox", "0 0 40 40");
  svg.setAttribute("fill", "none");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM16 30L6 20L8.82 17.18L16 24.34L31.18 9.16L34 12L16 30Z");
  path.setAttribute("fill", "#3D3D3D");

  svg.appendChild(path);

  return svg;

}
async function createUncheckMark(){
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "48");
  svg.setAttribute("height", "48");
  svg.setAttribute("viewBox", "0 0 48 48");

  const clipPath0 = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  clipPath0.setAttribute("id", "clip0_210_3756");
  const rect0 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect0.setAttribute("width", "48");
  rect0.setAttribute("height", "48");
  rect0.setAttribute("fill", "white");
  clipPath0.appendChild(rect0);

  const clipPath1 = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  clipPath1.setAttribute("id", "clip1_210_3756");
  const rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect1.setAttribute("width", "48");
  rect1.setAttribute("height", "48");
  rect1.setAttribute("fill", "white");
  clipPath1.appendChild(rect1);


  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 40C15.16 40 8 32.84 8 24C8 15.16 15.16 8 24 8C32.84 8 40 15.16 40 24C40 32.84 32.84 40 24 40Z");
  path.setAttribute("fill", "black");


  svg.appendChild(clipPath0);
  svg.appendChild(clipPath1);
  svg.appendChild(path);

  return svg;
}
async function updateTopButtons(){
  const copyServer = selectedList.name;
  await fetchBossList();
  const totalProgress = document.querySelector('.totalProgress');
  totalProgress.textContent = `${selectedList.weeklyBosses}/180`;
  await updateProgressBar();
  const totalGoldValue = document.querySelector('.totalGoldValue');
  newGoldValue = `${selectedList.totalGains.toLocaleString('en-US')}`;
  const fontSize = await adjustFontSizeToFit(newGoldValue);
  totalGoldValue.style.fontSize = fontSize + 'px';
  totalGoldValue.textContent = newGoldValue;
  const characters = document.querySelector('.characters');
  if(copyServer != selectedList.name){
    characters.innerHTML = '';
    loadCharacterCards()
  }
}

async function updateProgressBar(){
  const InnerEXPBar = document.querySelector('.InnerEXPBar');
  let barSize = (selectedList.weeklyBosses / 180) * 223;
	if (selectedList.weeklyBosses == 180) {
    barSize = 223;
    InnerEXPBar.style.backgroundColor = '#48AA39'; 
  }
  InnerEXPBar.style.width = `${barSize}px`;

}


function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

  // Check if the cookie is 'selectedServerContent'
  const path = name === 'selectedServerContent' ? '/' : '';

  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=${path}`;
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

function setupServerDropdownToggle() {
  const dropdownToggle = document.querySelector('.dropdownToggle');
  const svgIcon = dropdownToggle.querySelector('.icon');
  let isOpen = false;

  dropdownToggle.addEventListener('click', function() {
    isOpen = !isOpen;

    dropdownToggle.classList.toggle('open', isOpen);
    dropdownToggle.classList.toggle('closed', !isOpen);
    svgIcon.classList.toggle('rotate', isOpen);
  });
}

async function handleServerButtonClick(serverButton, serverButtons) {
  const selectedButton = document.querySelector('.SelectedButton');
  serverButtons.forEach(button => {
    if (button !== serverButton) {
      button.classList.add('not-checked');
      button.classList.remove('checked');
    }
  });

  swapContentAndStoreCookie(selectedButton, serverButton);
  server = selectedButton.querySelector('span').innerText;
  serverButton.classList.toggle('not-checked');
  serverButton.classList.toggle('checked');
  updateTopButtons();
}

