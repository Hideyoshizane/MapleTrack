window.bossList;
window.bossJson;
window.server;
window.selectedList;
window.username;

document.addEventListener('DOMContentLoaded', async () => {
    server = getCookie('selectedServerContent');
    if(server == undefined) {
      server = 'Scania';
      setCookie('selectedServerContent', server, 7);
    }
    await fetchBossList();
    await loadPage();

  setupServerDropdownToggle();
  await setupCharactersDropdownToggle();
  setupBossClickEvents();

  const serverButtons = document.querySelectorAll('.serverButton'); 
    
    serverButtons.forEach(serverButton => {
      serverButton.addEventListener('click', async () => {
        await handleServerButtonClick(serverButton, serverButtons);
      });
    });

  const editButton = document.querySelector('.editButton');
  editButton.addEventListener('click', async () => {
    var url = `/editBosses`;
    window.location.href = url;
  });

})

async function fetchBossList(){
  try {
    username = document.getElementById("userdata").getAttribute('data-username');
  
    const response =  await fetch(`/bossList/${username}`);
    bossList = await response.json();

    const jsonPath = '../../../public/data/bosses.json';
    bossJson = await fetch(jsonPath).then((response) => response.json());


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
  const Gold = await createImageElement(`../../public/assets/icons/menu/stash.webp`,'Gold Icon', 'goldIcon');
  const GoldtextDiv = createDOMElement('div', 'GoldTextDiv');

  const totalGainText = createDOMElement('span', 'totalGainText', 'Total Gain');
  const GainValue = `${selectedList.totalGains.toLocaleString('en-US')}`;
  const totalGainValue = createDOMElement('span','totalGoldValue', GainValue);
  const fontSize = await adjustFontSizeToFit(GainValue, 265, 32);
  totalGainValue.style.fontSize = fontSize + 'px';

  GoldtextDiv.appendChild(totalGainText);
  GoldtextDiv.appendChild(totalGainValue);
  const totalGainDiv = createDOMElement('div', 'totalGainDiv');
  totalGainDiv.appendChild(Gold);
  totalGainDiv.appendChild(GoldtextDiv);
  parentDiv.appendChild(totalGainDiv);
}

async function adjustFontSizeToFit(totalGainValue, maxWidth, originalFontSize) {

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
        createdSelectedButton.classList.toggle('not-selected');

        if(server){
          updateToCookie(selectedServer, server);
        }
        else{
          createdSelectedButton.classList.toggle('selected');
        }
        isFirstButton = false;
      }

      if(createdButton.querySelector('span').textContent === server){
        createdButton.classList.toggle('not-selected');
        createdButton.classList.toggle('selected');
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

  createdButton.classList.toggle('not-selected');

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
    dropdown = createDOMElement('div', 'characterDropdown');

    characterButton = createDOMElement('div', 'characterButton');
    buttonWrapper = createDOMElement('button', 'buttonWrapper');
    buttonWrapper.classList.add('closed');
    
    bossDiv = createDOMElement('div', 'bossButtonDiv');

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
      for(bosses of characters.bosses){
        const bossButton = await createBossButton(bosses);
        bossDiv.appendChild(bossButton);
        if(bosses.checked == true){
          totalChecks += 1;
        }
      }
    }

    let checks;
    
    if(totalChecks == characters.bosses.length){
      buttonWrapper.style.backgroundColor = "#9EE493";
      checks = await createCheckMark();
    }
    else{
      buttonWrapper.style.backgroundColor = "#D7D7D7";
      checks = createDOMElement('span', 'checked', `${totalChecks}/${characters.bosses.length}`);
    }
    checks.setAttribute('checked', totalChecks);
    checks.setAttribute('total', characters.bosses.length);
    characterButton.appendChild(checks);

    const arrowSVG = await createArrowSVG();
    arrowSVG.querySelector('path').setAttribute('fill', '#3D3D3D');
    
    characterButton.appendChild(arrowSVG);

    buttonWrapper.appendChild(characterButton);
    buttonWrapper.appendChild(bossDiv);

    dropdown.appendChild(buttonWrapper);

    parentDiv.appendChild(dropdown);
  }
}
async function createBossButton(boss){
  const bossData = bossJson.find(bossData => bossData.name == boss.name);

  const bossImgPath = bossData.img;
  const bossImage = await createImageElement(bossImgPath, `${boss.name}`, 'bossImg');

  const bossInfo = createDOMElement('span', 'BossName', `${boss.difficulty} ${boss.name}`);
  bossInfo.setAttribute('name', boss.name);
  bossInfo.setAttribute('difficult', boss.difficulty);

  const bossValue = createDOMElement('span', 'BossValue', `${boss.value.toLocaleString('en-us')}`);
  bossValue.setAttribute('value', boss.value);

  const fontSize = await adjustFontSizeToFit(bossInfo.textContent, 268, 32);
  bossInfo.style.fontSize = fontSize + 'px';

  const checkMark = boss.checked ? await createCheckMark() : await createUncheckMark();



  const bossButton = createDOMElement('button', 'BossButton');
  const bossText = createDOMElement('div', 'BossText');

  bossText.appendChild(bossInfo);
  bossText.appendChild(bossValue);

  bossButton.appendChild(bossImage);
  bossButton.appendChild(bossText);
  bossButton.appendChild(checkMark);

  bossButton.style.backgroundColor = boss.checked ? "#9EE493" :  "#D7D7D7";

  return bossButton;
}
async function createCheckMark(){
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("checked");
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

async function createUncheckMark() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("unchecked");

  svg.setAttribute("width", "40");
  svg.setAttribute("height", "40");
  svg.setAttribute("viewBox", "0 0 40 40");
  svg.setAttribute("fill", "none");


  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 36C11.16 36 4 28.84 4 20C4 11.16 11.16 4 20 4C28.84 4 36 11.16 36 20C36 28.84 28.84 36 20 36Z");
  path.setAttribute("fill", "#3D3D3D");

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
  const fontSize = await adjustFontSizeToFit(newGoldValue, 265, 32);
  totalGoldValue.style.fontSize = fontSize + 'px';
  totalGoldValue.textContent = newGoldValue;
  const characters = document.querySelector('.characters');
  if(copyServer != selectedList.name){
    characters.innerHTML = '';
    loadCharacterCards();
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

async function setupCharactersDropdownToggle() {
  document.body.addEventListener('click', async (event) => {
    if(event.target.closest('.BossButton')){
      return;
    }
    if (event.target.closest('.buttonWrapper')) {
      const button = event.target.closest('.buttonWrapper');
      const svgIcon = button.querySelector('.icon');
        button.classList.toggle('open');
        button.classList.toggle('closed');
        svgIcon.classList.toggle('rotate');
        const toggle = button.classList.contains('open') ? true : false;
          await updateGrid(event.target, toggle);
    }
  });
  
}
async function updateGrid(buttonWrapper, toggle){
  const characterDropdown = document.querySelectorAll('.characterDropdown');
  const grid =  characterDropdown[0].parentElement;
  const quantity = characterDropdown.length;
  const numRows = Math.ceil(quantity/ 3);
  if(toggle){
    for (let i = 0; i < characterDropdown.length; i++) {
      if (characterDropdown[i].contains(buttonWrapper)) {
        const startIndexOfLastRow = (numRows - 1) * 3;
        const endIndexOfLastRow = quantity - 1;
        if(i >= startIndexOfLastRow && i <= endIndexOfLastRow){
          const height = (numRows * 150) + 322;
          grid.style.minHeight = height + 'px';
        }

        break;
      }
    }
  }else{
    grid.style.transition = 'min-height 0.3s ease';
    grid.style.minHeight =  '615px';
  }
}

async function handleServerButtonClick(serverButton, serverButtons) {
  const selectedButton = document.querySelector('.SelectedButton');
  serverButtons.forEach(button => {
    if (button !== serverButton) {
      button.classList.add('not-selected');
      button.classList.remove('selected');
    }
  });

  swapContentAndStoreCookie(selectedButton, serverButton);
  server = selectedButton.querySelector('span').innerText;
  serverButton.classList.toggle('not-selected');
  serverButton.classList.toggle('selected');
  updateTopButtons();
}

function setupBossClickEvents() {
	document.body.addEventListener('click', async (event) => {
		if (event.target.closest('.BossButton')) {
			const button = event.target.closest('.BossButton');

			const bossName = button.querySelector('.BossName').getAttribute('name');
			const difficult = button
				.querySelector('.BossName')
				.getAttribute('difficult');
			const value = button.querySelector('.BossValue').getAttribute('value');
			const characterClass = button
				.closest('.buttonWrapper')
				.querySelector('.characterClass').innerText;
			const date = DateTime.utc();
			const checkMark = button.querySelector('.checked') ? true : false;
			const requestContent = {
				server: server,
				username: username,
				characterClass: characterClass,
				bossName: bossName,
				difficult: difficult,
				value: value,
				date: date,
				checkMark: !checkMark,
			};

			fetch('/checkBoss', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestContent),
			}).catch((error) => {
				console.error('Error:', error);
			});

			const checkSVG = checkMark
				? button.querySelector('.checked')
				: button.querySelector('.unchecked');
			const newSVG = checkMark
				? await createUncheckMark()
				: await createCheckMark();
			checkSVG.replaceWith(newSVG);
			await updateCharacterButton(button, !checkMark);
			updateTopButtons();
		}
	});
}

async function updateCharacterButton(button, checkMark) {
  const characterButton = button.parentElement.parentElement.querySelector('.characterButton');
  let checks = characterButton.querySelector('.checked');
  let checked = Number(checks.getAttribute('checked'));
  const total = checks.getAttribute('total');
  checked = checkMark ? checked + Number(1) : checked - Number(1);

  if(checked == total){
    const checkSVG = await createCheckMark();
    checks.replaceWith(checkSVG);
    characterButton.style.backgroundColor = "#9EE493";
    checks = checkSVG;
  }else{
    checkedSpan = createDOMElement('span', 'checked', `${checked}/${total}`);
    checks.replaceWith(checkedSpan);
    checks = checkedSpan;
    characterButton.style.backgroundColor = "#D7D7D7";
  }
  checks.setAttribute("checked", checked);
  checks.setAttribute("total", total);
  button.style.backgroundColor = checkMark ? "#9EE493": "#D7D7D7";

}