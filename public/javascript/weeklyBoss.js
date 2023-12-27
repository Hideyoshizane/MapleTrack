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

  setupDropdownToggle();
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
  await loadFlashMessage();
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

async function loadPage(){
    await loadTopButtons();
    await loadCharacterCards();
}

async function loadTopButtons(){
    await createBossingLogo();
    await createWeekProgress();
    await createTotalGain();
    const data = await fetch('/userServer').then(response => response.json());

    await loadServerButtons(data, document.querySelector('.topButtons'));
    await createEditBossesButton();
}

async function createBossingLogo(){
    const parentDiv = document.querySelector('.topButtons');

    const bossDiv = createDOMElement('div', 'bossDiv');
    
    const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
    const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');

    const pathElements = bossIcon.querySelectorAll("path");

    pathElements.forEach((path) => {
      path.setAttribute("fill", '#3D3D3D');
    });

    const bossSpan = createDOMElement('span', 'bossHunting', 'Boss Hunting');

    bossDiv.appendChild(bossIcon);
    bossDiv.appendChild(bossSpan);

    parentDiv.appendChild(bossDiv);
}

async function createWeekProgress(){
    const parentDiv = document.querySelector('.topButtons');
    const WeekProgressDiv = createDOMElement('div', 'WeekProgressDiv');
    const crystal = await createImageElement(`../../public/assets/icons/menu/crystal.webp`,'Boss Crystal Icon', 'crystalIcon');

    const WeekProgress = createDOMElement('span','weekProgress', 'Week Progress');
    const totalProgress = createDOMElement('span','totalProgress', `${selectedList.weeklyBosses}/180`);
    const levelBarData = {
      level: selectedList.weeklyBosses,
      targetLevel: 180,
      jobType: 'default',
    }
    const progressBar = await createLeveLBar(levelBarData, 223, "WeeklyProgress");    

    const textDiv = createDOMElement('div', 'WeekTextDiv');

    WeekProgressDiv.appendChild(crystal);
    textDiv.appendChild(WeekProgress);
    textDiv.appendChild(totalProgress);
    textDiv.appendChild(progressBar);
    WeekProgressDiv.appendChild(textDiv);
    parentDiv.appendChild(WeekProgressDiv);
}

async function createTotalGain(){
  const parentDiv = document.querySelector('.topButtons');
  const Gold = await createImageElement(`../../public/assets/icons/menu/stash.webp`,'Gold Icon', 'goldIcon');
  const GoldtextDiv = createDOMElement('div', 'GoldTextDiv');

  const totalGainText = createDOMElement('span', 'totalGainText', 'Total Gain');
  const GainValue = `${selectedList.totalGains.toLocaleString('en-US')}`;
  const totalGainValue = createDOMElement('span','totalGoldValue', GainValue);
  totalGainValue.style.fontSize = await adjustFontSizeToFit(totalGainValue, 265, 32) + 'px';

  GoldtextDiv.appendChild(totalGainText);
  GoldtextDiv.appendChild(totalGainValue);
  const totalGainDiv = createDOMElement('div', 'totalGainDiv');
  totalGainDiv.appendChild(Gold);
  totalGainDiv.appendChild(GoldtextDiv);
  parentDiv.appendChild(totalGainDiv);
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

    const imgSource = `../../public/assets/buttom_profile/${getCode(characters)}.webp`;
    characterImage = await createImageElement(imgSource, 'character Profile', 'profile');

    characterName = createDOMElement('span', 'characterName',`${characters.name}`);
    characterName.style.fontSize = await adjustFontSizeToFit(characterName, 182, 28) + 'px';
    characterClass = createDOMElement('span', 'characterClass', `${characters.class}`);

    characterWrapper = createDOMElement('div', 'characterWrapper');
  
    characterWrapper.appendChild(characterName);
    characterWrapper.appendChild(characterClass);

    characterButton.appendChild(characterImage);
    characterButton.appendChild(characterWrapper);

    let totalChecks = 0;
    if(characters.bosses.length > 0){
      const sortedBossList = sortBossList(characters.bosses);
      for(bosses of sortedBossList){
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

  const bossInfo = createDOMElement('span', 'BossName', `${boss.difficulty} ${boss.name.replace(/\n/g, ' ')}`);
  bossInfo.style.fontSize = await adjustFontSizeToFit(bossInfo, 286, 32) + 'px';
  bossInfo.setAttribute('name', boss.name);
  bossInfo.setAttribute('difficult', boss.difficulty);

  const bossValue = createDOMElement('span', 'BossValue', `${boss.value.toLocaleString('en-us')}`);
  bossValue.setAttribute('value', boss.value);

 

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


async function updateTopButtons(){
  const copyServer = selectedList.name;

  await fetchBossList();

  const totalProgress = document.querySelector('.totalProgress');
  totalProgress.textContent = `${selectedList.weeklyBosses}/180`;

  await updateExpBar(document.querySelector('.progressBar'), selectedList.weeklyBosses, 180, 223, 'default');

  const totalGoldValue = document.querySelector('.totalGoldValue');
  newGoldValue = `${selectedList.totalGains.toLocaleString('en-US')}`;

  totalGoldValue.style.fontSize = await adjustFontSizeToFit(totalGoldValue, 265, 32) + 'px';
  totalGoldValue.textContent = newGoldValue;

  const characters = document.querySelector('.characters');
  if(copyServer != selectedList.name){
    characters.innerHTML = '';
    loadCharacterCards();
  }
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
  const characterDropdown = document.querySelector('.characterDropdown');
  const grid =  characterDropdown.parentElement;
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
	if (server !== serverButton.querySelector('span').innerText) {
		serverButtons.forEach((button) => {
			button.classList.add('notSelected');
			button.classList.remove('selected');
		});

		swapContentAndStoreCookie(selectedButton, serverButton);

		server = selectedButton.querySelector('span').innerText;

		serverButton.classList.toggle('notSelected');
		serverButton.classList.toggle('selected');
		await updateTopButtons();
	}
}


function setupBossClickEvents() {
	document.body.addEventListener('click', async (event) => {
		if (event.target.closest('.BossButton')) {
			const button = event.target.closest('.BossButton');

			const bossName = button.querySelector('.BossName').getAttribute('name');
			const difficult = button.querySelector('.BossName').getAttribute('difficult');
			const value = button.querySelector('.BossValue').getAttribute('value');
			const characterClass = button.closest('.buttonWrapper').querySelector('.characterClass').innerText;
			const date = DateTime.utc().toJSDate();
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

			await fetch('/checkBoss', {
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
			await updateTopButtons();
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


async function loadFlashMessage() {
  const type = getCookie('type');
  if(type){
    const center = document.querySelector('.center-container');
    const message = getCookie('message');
    const div = createDOMElement('div', 'flash', message);
    div.classList.add(type);
    div.classList.add('notVisible');
    center.appendChild(div);
    
    setTimeout(() => {
      div.classList.add('visible');
    }, 500);

    setTimeout(() => {
      div.classList.toggle('visible');
    }, 1500);
  }
}

function sortBossList(bossList) {
  return bossList.sort((a, b) => {
      const resetOrder = { "Daily": 0, "Weekly": 1 };
      const resetComparison = resetOrder[a.reset] - resetOrder[b.reset];
      if (resetComparison !== 0) {
          return resetComparison;
      }

      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB);
  });
}
