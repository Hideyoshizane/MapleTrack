document.addEventListener('PageLoaded', async () => {
    try {

        if(Character){
            await setupCharacterDropdownToggle();
            await setupCharacterButtonsEvent();
            await setupBossesButtonEvent();
          }
          await setupTopButtonsEvent();
  
    }
    catch(error){
      console.error('Error loading:', error);
    }
  
  });


  async function setupCharacterDropdownToggle() {
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
  

  async function setupCharacterButtonsEvent(){

    const characterButtons = document.querySelectorAll('.characterButton'); 
        
    characterButtons.forEach(characterButton => {
      characterButton.addEventListener('click', async () => {
        await handleCharacterButtonClick(characterButton, characterButtons);
      });
    });
  
  }


  async function handleCharacterButtonClick(characterButton, characterButtons) {
    const selectedCharacterButton = document.querySelector('.SelectedCharacterButton');
    if (characterButton.querySelector('.characterName').innerText !== selectedCharacterButton.querySelector('.characterName').innerText) {
      characterButtons.forEach(button => {
        const checkSVG = button.querySelector('svg');
        button.classList.add('notSelected');
        button.classList.remove('selected');
        if (checkSVG) {
          button.removeChild(checkSVG);
        }
      });
  
      swapContent(selectedCharacterButton, characterButton);
      characterButton.classList.toggle('notSelected');
      characterButton.classList.toggle('selected');
  
      const checkSVG = await createCheckSVG();
      characterButton.appendChild(checkSVG);
  
      await changeCharacterIncome();
      await updateBosses();
    }
  }


  async function setupBossesButtonEvent() {
	const body = document.body;

	//create interaction for blocked buttons
	let blockedTooltip;
	body.addEventListener('mouseover', async (event) => {
		const target = event.target;
		const blockedElement = target.closest('.blocked');
		if (blockedElement) {
			const buttonRect = blockedElement.getBoundingClientRect();
			const minLevel = blockedElement.getAttribute('minLevel');
			blockedTooltip = await createBlockedTooltip(buttonRect, minLevel);
			body.appendChild(blockedTooltip);
		}
	});
	body.addEventListener('mouseout', (event) => {
		const target = event.target;
		const blockedElement = target.closest('.blocked');
		if (blockedElement) {
			body.removeChild(blockedTooltip);
		}
	});
	//iteraction for buttons that are not daily and are not blocked
	body.addEventListener('click', async (event) => {
		const clickedButton = event.target.closest(
			'.easyButton, .normalButton, .hardButton, .chaosButton, .extremeButton'
		);
		if (clickedButton) {
			const isBlocked = clickedButton.classList.contains('blocked');
			const hasSelect = clickedButton.querySelector('.option');

			if (!isBlocked && !hasSelect) {
				await buttonClickedFunctional(clickedButton);
			}
		}
	});

	//Iteraction for buttons with dropdown;
  body.addEventListener('mouseover', (event) => {
    if (event.target.classList.contains('dropdownText')) {
      let dropdown = event.target.parentElement;
      dropdown = dropdown.querySelector('.dailyDropdown');
      dropdownExpand(dropdown, true);
    }
  });
  body.addEventListener('click', async (event) => {
    if (event.target.classList.contains('option')) {
      const dropdownWrapper = event.target.parentElement.parentElement;
      const dropdown = event.target.parentElement;
      const newValue = event.target.getAttribute('value');
      dropdownWrapper.setAttribute('value', newValue);
      const dropdownText = dropdownWrapper.querySelector('.dropdownText');
      dropdownText.innerText = newValue > 0 ?`${newValue}x` : `${newValue}`;
      await updateBossValue(newValue, dropdown);
      await resetOtherDropdown(dropdown);
      dropdownExpand(dropdown, false);
    }
  });
  body.addEventListener('mouseover', (event) => {
    if (event.target.parentElement.classList.contains('dailyDropdown')) {
        event.target.parentElement.addEventListener('mouseleave', (e) => {
            const dropdown = event.target.parentElement;
            dropdownExpand(dropdown, false);
            e.stopPropagation();
        });
    }
});
}
function dropdownExpand(dropdown, expand = false){
  parentdiv = dropdown.parentNode;
  button = parentdiv.parentNode;
  buttonText = button.querySelector('.buttonText');
  buttonText.style.display = expand === true ? 'none' : 'block';
  dropdown.style.width = expand === true ? '6.094vw' : '0.938vw';
  dropdown.style.height = expand === true ? 'auto' : '2.744vh';
  dropdown.style.zIndex = expand === true ? '9' : '1';
  dropdown.style.display = expand === true ? 'block' : 'none';

  parentdiv.style.overflow = expand === true ? 'hidden' : '';
  parentdiv.style.marginTop = expand === true ? '0.188rem' : '0';
  parentdiv.style.width = expand === true ? '6.094vw' : 'auto';
  parentdiv.style.height = expand === true ? '200px' : '2.744vh';
  button.style.alignItems = expand === true ? 'flex-start' : 'center';
}

async function createBlockedTooltip(buttonRect, minLevel){
  const text = `Required Level: \n${minLevel}`;
  const tooltip = createDOMElement('div', 'blockedTooltip', text);

  const centerX = buttonRect.left + buttonRect.width / 2;
  const centerY = buttonRect.top + buttonRect.height / 2;

  tooltip.style.top = `${centerY + window.scrollY - 80}px`;
  tooltip.style.left = `${centerX + window.scrollX - 64}px`;

  return tooltip;
}

async function buttonClickedFunctional(button) {
  const bossBox = button.closest('.bossBox');

  const bossName = bossBox.querySelector('span').innerText;
  const difficulty = button.getAttribute('name');

  const totalIncomeSpan = bossBox.querySelector('.totalBossIncome');
  const value = Number(button.getAttribute('value'));
  console.log(value);
  const svgInsideButton = button.querySelector('svg');

  let newValue = 0;
  let otherButtonValue;

  if (svgInsideButton) {
    button.removeChild(svgInsideButton);
    newValue = 1;
    await updateBossIncomeSpan(value, bossBox, 0, totalIncomeSpan);
  } 
  else {
    const allSVGs = bossBox.querySelector('svg');
    if (allSVGs) {
      otherButtonValue = Number(allSVGs.parentElement.getAttribute('value'));
      allSVGs.parentElement.removeChild(allSVGs);      
    }
    await updateBossIncomeSpan(value, bossBox, 1, totalIncomeSpan);
    if(otherButtonValue){
      await updateBossIncomeSpan(otherButtonValue, bossBox, 0, totalIncomeSpan);
    }
    const color = bossesButtonColors[difficulty].color;
    const checkMark = await createCheckMark(color, 20);
    button.appendChild(checkMark);
  }

  const data = {
    newValue,
    difficult: difficulty
  };

  const boss = bossJson.filter(boss => boss.name === bossName);
  await insertBossOnList(boss, data);
}

async function updateBossIncomeSpan(value, bossBox, Add, totalIncomeSpan){
  let bossBoxValue = Number(bossBox.getAttribute('totalIncome'));
  bossBoxValue = Add == 1 ? bossBoxValue += value : bossBoxValue -= value;
  bossBox.setAttribute('totalIncome', bossBoxValue);

  totalIncomeSpan.innerText = bossBoxValue.toLocaleString('en-us');
  totalIncomeSpan.style.fontSize = await adjustFontSizeToFit(totalIncomeSpan, 4.896, 1) + 'rem';

  console.log(totalIncomeSpan.style.fontSize);

  if (bossBoxValue > 0) {
    bossBox.classList.add('open');
    bossBox.addEventListener('transitionend', () => {
      totalIncomeSpan.style.display = bossBox.classList.contains('open') ? 'block' : 'none';
    });
  } else if (bossBoxValue == 0 && bossBox.classList.contains('open')) {
    bossBox.classList.toggle('open');
    totalIncomeSpan.style.display = bossBox.classList.contains('open') ? 'block' : 'none';
  }
  if(Add == 2){
    if(bossBox.classList.contains('open')){
      bossBox.classList.toggle('open');
    }
    totalIncomeSpan.style.display = 'none';
    bossBox.setAttribute('totalIncome', 0);
    totalIncomeSpan.innerText = '0';
  }

}

async function updateBossValue(newValue, dropdown, characterChange = false){
    let bossBox = dropdown;

    const button = dropdown.parentNode.parentNode;
    const oldValue = Number(dropdown.parentNode.getAttribute('oldValue'));

		const difficult = dropdown.getAttribute('difficult');
    while (bossBox && (!bossBox.classList.contains('bossBox'))) {
      bossBox = bossBox.parentNode;
    }

    
    const totalIncomeSpan = bossBox.querySelector('.totalBossIncome');

    if (oldValue !== newValue) {
      let change = (oldValue > newValue ? -1 : 1) * Number(button.getAttribute('value')) * Math.abs(oldValue - newValue);
      await updateBossIncomeSpan(change, bossBox, 1, totalIncomeSpan);
    } 
    
    dropdown.parentNode.setAttribute('oldValue', newValue);

    const name = bossBox.querySelector('.bossName').textContent;
    const boss = bossJson.filter((boss)=> boss.name === name);

    const data = {
      newValue: Number(newValue), 
      difficult: difficult
    };

    if(!characterChange){
      await insertBossOnList(boss, data);
    }
    await changeCharacterIncome();
}
async function insertBossOnList(boss, data){

  const bossData = boss[0];
  const bossName = bossData.name;
  const difficultData = bossData.difficulties.find((difficulty) => difficulty.name === data.difficult);
  const value = serverType === 'Reboot' ? difficultData.value * 5 : difficultData.value;

  const foundBosses = Character.bosses.filter((searchBoss) => searchBoss.name === bossData.name);
  const foundBossIndex = Character.bosses.findIndex((searchBoss) => searchBoss.name === bossData.name && searchBoss.difficulty === data.difficult);
  if (foundBosses.length > 0) {
    //boss found
		const foundDifficulty = foundBosses.filter((searchBoss) => searchBoss.difficulty === data.difficult);
    //found difficult
    if(foundDifficulty.length > 0) {
      //if Daily Boss
      if(foundDifficulty[0].reset == 'Daily'){
        //If daily Total = 0, remove
        if(data.newValue == 0){
          Character.bosses.splice(foundBossIndex, 1);
        }else{
          //else update Daily Total
          foundDifficulty[0].DailyTotal = data.newValue;
        }
      } else{
        //Remove not daily boss
        Character.bosses.splice(foundBossIndex, 1);
      }
    }
    //Difficult not found, but found boss.
    else{
      //Add daily boss
      if(difficultData.reset == 'Daily'){
        //Add Daily boss
        const bossToAdd = await createBossToAdd(bossName, data.difficult, value, difficultData.reset, data.newValue);    
        Character.bosses.push(bossToAdd);
      }else{
        //Case difficult is not daiy.
        const weeklyIndex = Character.bosses.findIndex((searchBoss) => searchBoss.name === bossData.name && searchBoss.reset === difficultData.reset);
        if(weeklyIndex !== -1){
          //if there is same reset type of boss, remove it.
          Character.bosses.splice(weeklyIndex, 1);
        }
        const bossToAdd = await createBossToAdd(bossName, data.difficult, value, difficultData.reset, data.newValue);
        Character.bosses.push(bossToAdd);
      }
    }


  } else{ //If boss Name not found.
      if(difficultData.reset == 'Daily'){
        //Add Daily boss
        const bossToAdd = await createBossToAdd(bossName, data.difficult, value, difficultData.reset, data.newValue);
        Character.bosses.push(bossToAdd);
      }
      else{
        //Add Not Daily boss
        const bossToAdd = await createBossToAdd(bossName, data.difficult, value, difficultData.reset, data.newValue);
        Character.bosses.push(bossToAdd);
      }
    }

  await updateCharacterTotalIncome();
  await updateTotalCharactersIncome();
  await updateTotalSelected();
}

async function createBossToAdd(name, difficulty, value, difficultData, newValue) {
  const isDailyReset = difficultData === 'Daily';
  const bossToAdd = {
    name,
    difficulty,
    value,
    reset: difficultData,
    checked: false,
    date: null,
  };

  // Conditionally add the DailyTotal property
  if (isDailyReset) {
    bossToAdd.DailyTotal = newValue;
  }

  return bossToAdd;
}

async function resetOtherDropdown(dropdown){
  let bossBox = dropdown;
  const difficult = dropdown.getAttribute('difficult');

  while (bossBox && !bossBox.classList.contains('bossBox')) {
    bossBox = bossBox.parentNode;
  }
  const allDropdown = bossBox.querySelectorAll('.dailyDropdown');
  const filteredDropdown = Array.from(allDropdown).filter((dropdown) => dropdown.getAttribute('difficult') !== difficult);
  filteredDropdown.forEach(async dropdown => {
      const value = dropdown.parentElement.getAttribute('value');
      if(value > 0){
        dropdown.parentElement.setAttribute('value', 0);
        dropdown.parentElement.querySelector('.dropdownText').innerText = '0';
        await updateBossValue(0, dropdown);
      }
  });
}
async function updateCharacterTotalIncome(){
  let totalIncome = 0;
  for (const newBoss of Character.bosses) {
    const value = newBoss.reset == 'Daily' ? Number(newBoss.value) * newBoss.DailyTotal : Number(newBoss.value);
    totalIncome += value;
  }
  Character.totalIncome = totalIncome;
  await changeCharacterIncome();
}
async function changeCharacterIncome(){
  const SelectedCharacterButton = document.querySelector('.SelectedCharacterButton');
  const characterClass = SelectedCharacterButton.querySelector('.characterClass').innerText;

  Character = selectedList.characters.find(character => character.class === characterClass);
  const totalIncomeValue = Character.totalIncome.toLocaleString('en-us');
  const TotalIncome = document.querySelector('.characterTotalIncome');
  TotalIncome.textContent = totalIncomeValue;
  TotalIncome.style.fontSize = await adjustFontSizeToFit(TotalIncome, 4.896, 1) + 'rem';
}

async function updateTotalCharactersIncome(){
  const TotalIncome = document.querySelector('.TotalIncome');
  const newTotalIncome = await calculateTotalIncome();
  TotalIncome.innerText = newTotalIncome.toLocaleString('en-us');
}

async function updateBosses(){
  const bossesButtons =  document.querySelectorAll('.easyButton, .normalButton, .hardButton, .chaosButton, .extremeButton');
  bossesButtons.forEach(async button => {

    const bossBox = button.parentElement.parentElement;
    const totalIncomeSpan = bossBox.querySelector('.totalBossIncome');
    const buttonDiv = bossBox.querySelector('.buttonDiv');
    const totalDificulties = buttonDiv.querySelectorAll('button');
    const value = Number(button.getAttribute('value'));
    const minLevel = button.getAttribute('minLevel');
    const reset = button.getAttribute('reset');

    if(Character.level < minLevel){
     await updateButtonToBlock(button);
     await updateBossIncomeSpan(value, bossBox, 2, totalIncomeSpan);
    }

    if(Character.level >= minLevel){

      if(button.classList.contains('blocked')){
        button.classList.remove('blocked');
        const blockedIcon = button.querySelector('svg');
        button.removeChild(blockedIcon);
        buttonText = createDOMElement('span', 'buttonText', `${button.getAttribute('name')}`);
        if(totalDificulties.length == 4){
          buttonText.style.fontSize = '13px';
        }
        button.appendChild(buttonText);
      }

      if(reset == 'Daily' && !button.classList.contains('blocked') && button.querySelector('.option') === null){
        await insertDropdownOnButton(button, 0);
      }

      const bossName = button.parentElement.parentElement.querySelector('.bossName').innerText;
      const difficult = button.querySelector('.buttonText').innerText;
      const foundBoss = Character.bosses.find((searchBoss) => searchBoss.name === bossName && searchBoss.difficulty === difficult);
      if(foundBoss) {

        if(reset == 'Daily'){
          const dropdown = button.querySelector('.dailyDropdown');
          await updateBossValue(foundBoss.DailyTotal, dropdown, true);
          const dropdownText = button.querySelector('.dropdownText');
          dropdownText.innerText = foundBoss.DailyTotal;
          const dropdownWrapper = button.querySelector('.dropdownWrapper');
          dropdownWrapper.setAttribute('value', foundBoss.DailyTotal);
        }
        else{
          const hasCheck = button.querySelector('svg');
          if(!hasCheck) {
          const color = bossesButtonColors[difficult].color;
          const checkMark = await createCheckMark(color, 20);
          button.appendChild(checkMark);
          await updateBossIncomeSpan(value, bossBox, 1, totalIncomeSpan);
          }
        }
      } else{

        if(reset == 'Daily'){
          const dropdown = button.querySelector('.dailyDropdown');
          await updateBossValue(0, dropdown, true);
          const dropdownText = button.querySelector('.dropdownText');
          dropdownText.innerText = 0;
          const dropdownWrapper = button.querySelector('.dropdownWrapper');
          dropdownWrapper.setAttribute('value', 0);
        } else{
          const svgIcon = button.querySelector('svg');
          if(svgIcon){
            button.removeChild(svgIcon);
            await updateBossIncomeSpan(value, bossBox, 0, totalIncomeSpan);
          }
        }
      }
    }
  })
}


async function updateTotalSelected(){
    const totalBosses = await calculateTotalBosses();
    const totalSelectedBosses = document.querySelector('.totalSelectedBosses');
    totalSelectedBosses.innerText = `${totalBosses}/180`;
}

async function setupTopButtonsEvent(){
  const discardButton = document.querySelector('.discardButton');

  discardButton.addEventListener('click', () => {
    window.location.href = '/weeklyBoss';
  });

  const saveButton = document.querySelector('.saveButton');
  saveButton.addEventListener('click', async () => {
    selectedList['userOrigin'] = username;
    const response = await fetch('/saveBossChange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedList),
    });
    const success = response.ok;
		const type = success ? 'success' : 'failed';
		const message = success ? 'Boss list updated sucessfully' : 'There was an error updating';
		setCookieFlash('type', type,  50);
		setCookieFlash('message', message, 50);
    window.location.href = '/weeklyBoss';
  });
}

async function updateButtonToBlock(difficultButton){
    difficultButton.textContent = '';
    const blockMark = await createBlockMark();
    difficultButton.appendChild(blockMark);
  
    difficultButton.classList.add('blocked');
  }
  
  async function insertDropdownOnButton(difficultButton, DailyTotal){
    const dropdownValue= DailyTotal > 0 ? `${DailyTotal}x` : '0';
  
    const dropdown = createDOMElement('button', 'dailyDropdown');
    const dropdownWrapper = createDOMElement('div', 'dropdownWrapper');
    const dropdownText = createDOMElement('span', 'dropdownText', dropdownValue);
    const name = difficultButton.getAttribute('name');
  
    const color = bossesButtonColors[name].color;
    const backgroundColor = bossesButtonColors[name].backgroundColor;
    
  
    for(let i=0; i<= 7; i++){
      const text = i > 0 ? `${i}x a Week` : `${i}`;
      let option = createDOMElement('div', 'option', text);
      option.setAttribute('value', i);
      option.style.color = color;
      option.style.backgroundColor = backgroundColor;
      
      dropdown.appendChild(option);
    }
   
    dropdown.style.color = color;
    dropdown.style.backgroundColor = backgroundColor;
    dropdown.setAttribute('difficult', `${difficultButton.name}`);
    dropdownWrapper.setAttribute('oldValue', DailyTotal);
    dropdownWrapper.setAttribute('value', DailyTotal);
    dropdownWrapper.appendChild(dropdownText);
    dropdownWrapper.appendChild(dropdown);
    difficultButton.appendChild(dropdownWrapper);
  }
  
  const bossesButtonColors = {
    Easy:   { color: '#EDEDED', backgroundColor: '#9B9B9B' },
    Normal: { color: '#3D3D3D', backgroundColor: '#91C9E3' },
    Hard:   { color: '#3D3D3D', backgroundColor: '#E39294' },
    Chaos:  { color: '#EDEDED', backgroundColor: '#3D3D3D' },
    Extreme: { color: '#E39294', backgroundColor: '#FFFFFF' },
  };
  
  
  async function loadMissingCharacter(){
    const characterSelector = document.querySelector('.characterSelector');
    characterSelector.remove();
  
    const parentDiv = document.querySelector('.bosses');
    const warningSVG = await loadWarningSVG();
    const warningText = createDOMElement('span', 'warningText', 'No bossing character selected!');
    const warningDiv = createDOMElement('div', 'warningDiv');
  
    warningDiv.appendChild(warningSVG);
    warningDiv.appendChild(warningText);
    parentDiv.appendChild(warningDiv);
  }
  
  async function loadWarningSVG(){
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "420");
    svg.setAttribute("height", "420");
    svg.setAttribute("viewBox", "0 0 507 507");
  
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M253.5 0.583374C113.89 0.583374 0.583496 113.89 0.583496 253.5C0.583496 393.11 113.89 506.417 253.5 506.417C393.11 506.417 506.417 393.11 506.417 253.5C506.417 113.89 393.11 0.583374 253.5 0.583374ZM278.792 379.958H228.209V329.375H278.792V379.958ZM278.792 278.792H228.209V127.042H278.792V278.792Z");
    path.setAttribute("fill", "#D4D4D4");
    
    svg.appendChild(path);
    return svg;
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
  
  
  