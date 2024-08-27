window.bossList;
window.bossJson;
window.server;
window.selectedList;
window.username;
window.serverType;

document.addEventListener('DOMContentLoaded', async () => {
  server = getCookie('selectedServerContent');
  if(server == undefined){
    server = 'scania';
    setCookie('selectedServerContent', server, 7);
  }
  await fetchBossList();
  await loadPage();

  document.dispatchEvent(new Event('PageLoaded'));
})

async function fetchBossList(){
  try {
    username = document.getElementById("userdata").getAttribute('data-username');
  
    const bossList = await (await fetch(`/bossList/${username}`)).json();

    bossJson = await fetch('../../../public/data/bosses.json').then(response => response.json());

    selectedList = bossList.server;
    selectedList = selectedList.find(servers => servers.name === server.charAt(0).toUpperCase() + server.slice(1));
    serverType = selectedList.type;
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

    await loadServerButtons(data, document.querySelector('.dropdown'));
}

async function createBossingLogo(){
    const bossDiv = document.querySelector('.bossDiv');

    const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
    const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');

    const pathElements = bossIcon.querySelectorAll("path");

    pathElements.forEach((path) => {
      path.setAttribute("fill", '#3D3D3D');
    });

    const bossSpan = createDOMElement('span', 'bossHunting', 'Boss Hunting');

    bossDiv.appendChild(bossIcon);
    bossDiv.appendChild(bossSpan);
}

async function createWeekProgress(){

    const totalProgress = createDOMElement('span','totalProgress', `${selectedList.weeklyBosses}/180`);
    const textDiv = document.querySelector('.WeekTextDiv');

    const levelBarData = {
      level: selectedList.weeklyBosses,
      targetLevel: 180,
      jobType: 'default',
    }
    const progressBar = await createLeveLBar(levelBarData, 11.615, "WeeklyProgress");    

    textDiv.appendChild(totalProgress);
    textDiv.appendChild(progressBar);
}

async function createTotalGain(){
  const parentDiv = document.querySelector('.GoldTextDiv');

  const GainValue = `${selectedList.totalGains.toLocaleString('en-US')}`;
  const totalGainValue = createDOMElement('span','totalGoldValue', GainValue);
  totalGainValue.style.fontSize = await adjustFontSizeToFit(totalGainValue, 13.802, 2) + 'rem';

  parentDiv.appendChild(totalGainValue);
}

  
async function loadCharacterCards(){
  const parentDiv = document.querySelector('.characters');
  const fragment = document.createDocumentFragment();

  const loader = createDOMElement('span', 'loader');
  loader.style.marginTop = '250px'; 
  loader.style.marginLeft = '693px';
  parentDiv.appendChild(loader);

  for (characters of selectedList.characters) {
    dropdown = createDOMElement('div', 'characterDropdown');

    characterButton = createDOMElement('div', 'characterButton');
    buttonWrapper = createDOMElement('button', 'buttonWrapper');
    buttonWrapper.classList.add('closed');

    bossDiv = createDOMElement('div', 'bossButtonDiv');

    const imgSource = `../../public/assets/buttom_profile/${getCode(characters)}.webp`;
    characterImage = await createImageElement(imgSource, 'character Profile', 'profile');

    characterName = createDOMElement('span', 'characterName', `${characters.name}`);
    characterName.style.fontSize = await adjustFontSizeToFit(characterName, 9.479, 1.75) + 'rem';
    characterClass = createDOMElement('span', 'characterClass', `${characters.class}`);

    characterWrapper = createDOMElement('div', 'characterWrapper');

    characterWrapper.appendChild(characterName);
    characterWrapper.appendChild(characterClass);

    characterButton.appendChild(characterImage);
    characterButton.appendChild(characterWrapper);

    let totalChecks = 0;
    if (characters.bosses.length > 0) {
      const sortedBossList = sortBossList(characters.bosses);
      for (bosses of sortedBossList) {
        const bossButton = await createBossButton(bosses);
        bossDiv.appendChild(bossButton);
        if (bosses.checked == true) {
          totalChecks += 1;
        }
      }
    }

    let checks;

    if (totalChecks == characters.bosses.length) {
      buttonWrapper.style.backgroundColor = "#9EE493";
      checks = await createCheckMark();
    } else {
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

    fragment.appendChild(dropdown);
  }

  const loaderSpan = parentDiv.querySelector('.loader');
  if(loaderSpan)
    parentDiv.removeChild(loaderSpan);

  parentDiv.appendChild(fragment);
}


async function createBossButton(boss){
  const bossData = bossJson.find(bossData => bossData.name == boss.name);
  const bossImgPath = bossData.img;
  const bossImage = await createImageElement(bossImgPath, `${boss.name}`, 'bossImg');

  const bossInfo = createDOMElement('span', 'BossName', `${boss.difficulty} ${boss.name.replace(/\n/g, ' ')}`);
  bossInfo.style.fontSize = await adjustFontSizeToFit(bossInfo, 14.896, 2) + 'rem';
  bossInfo.setAttribute('name', boss.name);
  bossInfo.setAttribute('difficult', boss.difficulty);
  
  const bossValue = createDOMElement('span', 'BossValue', `${getValueByNameAndDifficulty(boss.name, boss.difficulty).toLocaleString('en-us')}`);
  bossValue.setAttribute('value', getValueByNameAndDifficulty(boss.name, boss.difficulty));

 

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

  await updateExpBar(document.querySelector('.progressBar'), selectedList.weeklyBosses, 180, 11.615, 'default');

  const totalGoldValue = document.querySelector('.totalGoldValue');
  newGoldValue = `${selectedList.totalGains.toLocaleString('en-US')}`;

  totalGoldValue.style.fontSize = await adjustFontSizeToFit(totalGoldValue, 13.802, 2) + 'rem';
  totalGoldValue.textContent = newGoldValue;

  const characters = document.querySelector('.characters');
  if(copyServer != selectedList.name){
    characters.innerHTML = '';
    loadCharacterCards();
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


function getValueByNameAndDifficulty(bossName, difficultyName) {
  // Find the boss by name
  const boss = bossJson.find(b => b.name === bossName);
  if (boss) {
    // Find the difficulty by name within the selected boss
    const difficulty = boss.difficulties.find(d => d.name === difficultyName);
    if (difficulty) {
      // Calculate the value based on the server type without modifying the original value
      return serverType === 'Reboot' ? difficulty.value * 5 : difficulty.value;
    }
  }
  return null; // Return null if the boss or difficulty is not found
}
