window.bossList;
window.server;
window.selectedList;
window.Character;
window.username;


document.addEventListener('DOMContentLoaded', async () => {
    server = getCookie('selectedServerContent'); 
    if(server == undefined) {
      server = 'Scania';
      setCookie('selectedServerContent', server, 7);
    }
    await fetchBossList();
    Character = selectedList.characters[0];
    await loadPage();

    setupCharacterDropdownToggle()

    const characterButtons = document.querySelectorAll('.characterButton'); 
    
    characterButtons.forEach(characterButton => {
      characterButton.addEventListener('click', async () => {
        await handleCharacterButtonClick(characterButton, characterButtons);
      });
    });

    const button = document.querySelector('.teste');
    button.addEventListener('click', async () =>{
        const placeholder = [
            {
              server: server,
              userOrigin: username,
              characters: [
                {
                  name: 'Sayaka',
                  bosses: [{
                    name: 'Zakum',
                    value: '1000000',
                    reset: 'Daily',
                    DailyTotal: '5',
                    checked: false,
                    date: null
                  }],
                },
                {
                  name: 'Lilith',
                  bosses: [{
                    name: 'Zakum',
                    value: '1000000',
                    reset: 'Daily',
                    DailyTotal: '7',
                    checked: false,
                    date: null
                  }],
                },
              ],
            },
          ];
      fetch('/saveBossChange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(placeholder),
      });
    });

});

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

async function loadPage(){
    await loadTopButtons();
    await loadCharacterSelector();
    await loadBosses();
}

async function loadTopButtons(){
    await createBossingLogo();
    await createTotalSelected();
    await createTotalIncomeCharacter();
    await createTopButtons();
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


async function createTotalSelected(){
    const parentDiv = document.querySelector('.topButtons');
    const totalSelectedDiv = createDOMElement('div', 'totalSelectedDiv');
    const crystal = await createImageElement(`../../public/assets/icons/menu/crystal.webp`,'Boss Crystal Icon', 'crystalIcon');

    const selectedTotal = createDOMElement('span','selectedTotal', 'Selected Boss Total');
    const totalBosses = await calculateTotalBosses();
    const totalSelectedBosses = createDOMElement('span','totalSelectedBosses', `${totalBosses}/180`);

    const textDiv = createDOMElement('div', 'WeekTextDiv');

    
    totalSelectedDiv.appendChild(crystal);
    textDiv.appendChild(selectedTotal);
    textDiv.appendChild(totalSelectedBosses);
    totalSelectedDiv.appendChild(textDiv);
    parentDiv.appendChild(totalSelectedDiv);
}
    

async function calculateTotalBosses(){
    let totalBosses = 0;
    for(characters of selectedList.characters){
        for(bosses of characters.bosses){
            if(bosses.reset === 'Daily'){
                totalBosses += bosses.DailyTotal;
            }
            else{
                totalBosses++;
            }
        }
    }
    return totalBosses;
}

async function createTotalIncomeCharacter(){
    const parentDiv = document.querySelector('.topButtons');
    const totalIncomeDiv = createDOMElement('div', 'totalIncomedDiv');
    const Gold = await createImageElement(`../../public/assets/icons/menu/gold.webp`,'Gold Icon', 'goldIcon');
    const IncomeTextDiv = createDOMElement('div', 'IncomeTextDiv');
    const totalIncomeText = createDOMElement('span', 'totalIncomeText', 'Character Total Income');
    const totalIncome = await calculateTotalCharacterIncome();
    const totalIncomeSpan = createDOMElement('span', 'TotalIncome', `${totalIncome}`);
    const fontSize = await adjustFontSizeToFit(totalIncome, 224, 32);
    totalIncomeSpan.style.fontSize = fontSize + 'px';

    IncomeTextDiv.appendChild(totalIncomeText);
    IncomeTextDiv.appendChild(totalIncomeSpan);
    totalIncomeDiv.appendChild(Gold);
    totalIncomeDiv.appendChild(IncomeTextDiv);
    parentDiv.appendChild(totalIncomeDiv);

}

async function calculateTotalCharacterIncome(){
    let totalIncome = 0;
    for(boss of Character.bosses){
        if(boss.reset === 'Daily'){
            totalIncome += (boss.value * boss.DailyTotal);
        }
        else{
            totalIncome += boss.value;
        }
    }
    return totalIncome.toLocaleString('en-US');
}

async function adjustFontSizeToFit(totalGainValue, boxWidth, originalSize) {
    const maxWidth = boxWidth;
    const originalFontSize = originalSize;
  
    const copy = document.createElement('span');
    copy.textContent = totalGainValue;
    copy.style.fontSize = originalFontSize + 'px';
    copy.style.fontFamily = 'Inter';
    copy.style.whiteSpace = 'pre-line';
  
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

async function createTopButtons(){
    const parentDiv = document.querySelector('.topButtons');
    const discardButton = createDOMElement('button', 'discardButton', 'Discard Changes');
    const saveButton = createDOMElement('button', 'saveButton', 'Save Changes');

    parentDiv.appendChild(discardButton);
    parentDiv.appendChild(saveButton);
}

async function loadCharacterSelector(){
    const parentDiv = document.querySelector('.characterSelector');

    const dropdownToggle = createDOMElement('button', 'dropdownToggle');
    dropdownToggle.id = 'dropdownToggle';

    const selectedCharacter = createDOMElement('div', 'selectedCharacter');
    const arrowSVG = await createArrowSVG();
    ///selectedCharacter.appendChild(arrowSVG);

    const characterContent = createDOMElement('div', 'characterContent');

    const fragment = document.createDocumentFragment();



    let isFirstButton = true;
    
    for(character of selectedList.characters){
        const createdButton = await createCharacterButton(character);
        createdButton.classList.toggle('not-checked');
        if(isFirstButton){
            Character = character.code;
            const createdSelectedButton = createdButton.cloneNode(true);

            createdSelectedButton.classList.replace('characterButton', 'SelectedCharacterButton');
            createdSelectedButton.appendChild(arrowSVG);

            selectedCharacter.appendChild(createdSelectedButton);
            isFirstButton = false;
            createdButton.classList.toggle('checked');
            createdButton.classList.toggle('not-checked');
            createdSelectedButton.classList.toggle('not-checked');
            const checkSVG = createCheckSVG();
            createdButton.appendChild(checkSVG);
        }

        fragment.appendChild(createdButton);
        characterContent.appendChild(fragment);
    }

    const dropdown = createDOMElement('div', 'dropdown');
    dropdownToggle.appendChild(selectedCharacter);
    dropdownToggle.appendChild(characterContent);
    dropdown.appendChild(dropdownToggle);
    parentDiv.appendChild(dropdown);

}

function createCheckSVG(){
    const checkSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    checkSVG.setAttribute('width', '40');
    checkSVG.setAttribute('height', '40');
    checkSVG.setAttribute('viewBox', '0 0 36 27');
    checkSVG.setAttribute('fill', 'none');
  
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 21.4L3.59999 13L0.799988 15.8L12 27L36 2.99995L33.2 0.199951L12 21.4Z');
    path.setAttribute('fill', '#3D3D3D');
  
    checkSVG.appendChild(path);
    return checkSVG;
  }

async function createArrowSVG() {
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("id", "icon");
    svgElement.setAttribute("width", "48px");
    svgElement.setAttribute("height", "48px");
    svgElement.setAttribute("viewBox", "0 0 1024 1024");
    svgElement.setAttribute("class", "icon");
  
    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute("d", "M917.333333 364.8L851.2 298.666667 512 637.866667 172.8 298.666667 106.666667 364.8 512 768z");
    pathElement.setAttribute("fill", "#3D3D3D");
    svgElement.appendChild(pathElement);
    return svgElement;
  }
  
async function createCharacterButton(character) {

    const characterButton = createDOMElement('button', 'characterButton');
    const imgSource = `../../public/assets/buttom_profile/${character.code}.webp`;
    characterImage = await createImageElement(imgSource, 'character Profile', 'profile');
    characterName = createDOMElement('span', 'characterName',`${character.name}`);
    characterClass = createDOMElement('span', 'characterClass', `${character.class}`);

    characterWrapper = createDOMElement('div', 'characterWrapper');
  
    characterWrapper.appendChild(characterName);
    characterWrapper.appendChild(characterClass);

    characterButton.appendChild(characterImage);
    characterButton.appendChild(characterWrapper);

    return characterButton;

}

async function loadBosses(){
    const parentDiv = document.querySelector('.bosses');


    const jsonPath = '../../../public/data/bosses.json';
    const bossesObject = await fetch(jsonPath).then((response) => response.json());
    const bossGrid = createDOMElement('div', 'bossGrid');

    for(const boss of bossesObject){
      const bossSlot = createDOMElement('div', 'bossSlot');
      const bossBox = createDOMElement('div', 'bossBox');
      const image = await createImageElement(boss.img, `${boss.name}` ,'bossPicture');
      const name = createDOMElement('span', 'bossName', boss.name);
      name.style.whiteSpace = 'pre-line';
      const fontSize = await adjustFontSizeToFit(boss.name, 130, 32);
      name.style.fontSize = fontSize + 'px';
      
      bossBox.appendChild(image);
      bossBox.appendChild(name);
      const buttonDiv = createDOMElement('div', 'buttonDiv');
      for(difficult of boss.difficulties){
        
        let classTag;
        let innerText;
        console.log(difficult)
        switch (difficult.name) {
					case 'Easy':
            classTag = 'easyButton';
            innerText = 'Easy';
						break;

					case 'Normal':
            classTag = 'normalButton';
            innerText = 'Normal';
						break;

					case 'Hard':
            classTag = 'hardButton';
            innerText = 'Hard';
						break;

					case 'Chaos':
            classTag = 'chaosButton';
            innerText = 'Chaos';
						break;

					case 'Extreme':
            classTag = 'extremeButton';
            innerText = 'Extreme';
						break;
				}
        difficultButton = createDOMElement('button',  `${classTag}`, `${innerText}`);
        buttonDiv.appendChild(difficultButton);
      }
      bossBox.append(buttonDiv);

      bossSlot.appendChild(bossBox);
      bossGrid.appendChild(bossSlot);
    }
    parentDiv.appendChild(bossGrid);
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
  
  function swapContent(selectedButton, characterButton) {
    const selectedImage = selectedButton.querySelector('img');
    const selectedName = selectedButton.querySelector('.characterName');
    const selectedClass = selectedButton.querySelector('.characterClass');
  
    const characterImage = characterButton.querySelector('img');
    const characterName = characterButton.querySelector('.characterName');
    const characterClass = characterButton.querySelector('.characterClass');


    selectedImage.setAttribute('alt', characterName.textContent);
    selectedImage.src = characterImage.src;
    selectedName.textContent = characterName.textContent;
    selectedClass.textContent = characterClass.textContent;
  
  }

  function setupCharacterDropdownToggle() {
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

  async function handleCharacterButtonClick(characterButton, characterButtons) {
    const selectedCharacterButton = document.querySelector('.SelectedCharacterButton');
    characterButtons.forEach(button => {
      const checkSVG = button.querySelector('svg');
      if (button !== characterButton) {
        button.classList.add('not-checked');
        button.classList.remove('checked');
      }
      if(checkSVG){
        button.removeChild(checkSVG);
      }
    });
    
    swapContent(selectedCharacterButton, characterButton);
    characterButton.classList.toggle('not-checked');
    characterButton.classList.toggle('checked');

    checkSVG = createCheckSVG();
    characterButton.appendChild(checkSVG);
    //updateIncome();
    //updateBosses();
  }
  
  