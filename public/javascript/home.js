window.cardBody;
window.username;
window.dailyJson;




document.addEventListener('DOMContentLoaded', async () => {
  try {

    username = document.getElementById('userdata').getAttribute('data-username');

    dailyJson = await fetch('../../../public/data/dailyExp.json').then((response) => response.json());

    const data = await fetch('/userServer').then(response => response.json());
    const mainContent = document.querySelector('.mainContent');
    await loadServerButtons(data, mainContent);

    setupDropdownToggle();
  
    const characterCardDiv = document.querySelector('.characterCards');
    const selectedButton = dropdownToggle.querySelector('.SelectedButton');
    await createCharacterCards();
  
    const serverButtons = document.querySelector('.serverSelector').querySelectorAll('.serverButton');     
    for (const serverButton of serverButtons) {
      serverButton.addEventListener('click', async () => {
        await handleServerButtonClick(serverButton, serverButtons, selectedButton, characterCardDiv);
      });
    }

    setupCardClickListeners();
    
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});


async function handleServerButtonClick(serverButton, serverButtons, selectedButton, characterCardDiv) {
  if(selectedButton.textContent !== serverButton.textContent) {
    serverButtons.forEach(button => {
      button.classList.add('notSelected');
      button.classList.remove('selected');
  });

  swapContentAndStoreCookie(selectedButton, serverButton);

  serverButton.classList.toggle('notSelected');
  serverButton.classList.toggle('selected');

  characterCardDiv.innerHTML = '';
  
  await createCharacterCards();

  setupCardClickListeners();
  }
}

function setupCardClickListeners() {
  cardBody.forEach((card) => {
    card.addEventListener('click', async () =>{
      const server = document.querySelector('.SelectedButton').querySelector('span').innerText;
      const character = card.getAttribute('characterclass');
      var url = `${username}/${server}/${character}`;
      window.location.href = url;
    });
  });
}

const filterButtons = document.querySelectorAll('.filterButton');
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
        filterCharacterCards(selectedValues);
        updateSelectedValuesCookie();
    });
});


async function createCharacterCards(){
  const parentDiv = document.querySelector('.characterCards');
  const selectedServer = document.querySelector('.SelectedButton').querySelector('span').innerText;


  const characters = await fetch(`/${username}/${selectedServer}`).then(response => response.json());

  const characterCards = await Promise.all(characters.map(generateCard));

  const characterCardFragment = document.createDocumentFragment();


  await sort(characterCards, false);
  
  characterCards.forEach((card) => {
    characterCardFragment.appendChild(card);
  });

  parentDiv.appendChild(characterCardFragment);
  filterCharacterCards(selectedValues);

  cardBody = document.querySelectorAll('.cardBody');
}

async function sort(cards, includeBossing = false) {
  const customOrder = ['mage', 'thief', 'warrior', 'bowman', 'pirate', 'bossing'];

  cards.sort((a, b) => {
    if (includeBossing || (a.jobType !== 'bossing' && b.jobType !== 'bossing')) {
      const indexA = customOrder.indexOf(a.jobType);
      const indexB = customOrder.indexOf(b.jobType);

      return indexA - indexB;
    }
    return 0;
  });
}

function filterCharacterCards(selectedValues){
  document.querySelectorAll('.cardBody').forEach((element) => {
    const jobType = element.getAttribute('jobType');
    const hasBossIcon = element.querySelector('.bossIcon');
    if (!selectedValues.includes(jobType))
      element.classList.add('off');
     else 
      element.classList.remove('off');


    if (selectedValues.includes('bossing') && hasBossIcon) 
      element.classList.remove('off');

    if (selectedValues.length === 0) 
      element.classList.remove('off');
  });
  cardBody = document.querySelectorAll('.cardBody');
}

async function generateCard(characterData){
  //Arcame Force Block
  const arcaneForce = createDOMElement('div', 'arcaneForce');

  const spanArcaneForce = createDOMElement('span', 'Title','Arcane Force');
  arcaneForce.appendChild(spanArcaneForce);

  const arcaneForceContent = await createForce(characterData, 'arcane');
  arcaneForce.appendChild(arcaneForceContent);

  //Sacred Force Block
  const sacredForce = createDOMElement('div', 'sacredForce');

  const spanSacredForce = createDOMElement('span', 'Title','Sacred Force');
  sacredForce.appendChild(spanSacredForce);

  const sacredForceContent = await createForce(characterData, 'sacred');
  sacredForce.appendChild(sacredForceContent);

  //appending Arcane and Sacred Force
  const forceDiv = createDOMElement('div', 'forceDiv');
  forceDiv.appendChild(arcaneForce);
  forceDiv.appendChild(sacredForce);

  //Creating character portrait image
  const portrait = await createCharacterPortrait(characterData);

  //upper part appending
  const upperPart = createDOMElement('div', 'upperPart');
  upperPart.appendChild(forceDiv);
  upperPart.appendChild(portrait);
  
  
  //link SKill creation
  const linkSkillContainer = await createLinkSkillContent(characterData);

  //Legion Creation
  const legionContainer = await createLegionContent(characterData);

  //Appending
  const linkLegion = createDOMElement('div', 'linkLegionContainer');

  linkLegion.appendChild(linkSkillContainer);
  linkLegion.appendChild(legionContainer);

  //Name and Boss Icon creation
  const nameAndLevel = await createLowerPart(characterData);

  //LowerPart appending

  const lowerPart = createDOMElement('div', 'lowerPart');
  lowerPart.appendChild(linkLegion);
  lowerPart.appendChild(nameAndLevel);

  //Bar level 
  const levelBarData = {
    level: characterData.level,
    targetLevel: characterData.targetLevel,
    jobType: characterData.jobType,
  }
  const levelBarWrapper = createDOMElement('div', 'levelBarWrapper');
  const levelBar = await createLeveLBar(levelBarData, 480, 'levelBar');

  levelBarWrapper.appendChild(levelBar);
  
  const cardBody = createDOMElement('div', 'cardBody');

  cardBody.setAttribute('jobType', characterData.jobType);
  cardBody.setAttribute('characterClass', getCode(characterData));

  cardBody.appendChild(upperPart);
  cardBody.appendChild(lowerPart);
  cardBody.appendChild(levelBarWrapper);

  return cardBody;
}

async function createForce(characterData, forceType) {
  let outerWrapper = document.createDocumentFragment();
  const forceData = forceType === 'arcane' ? characterData.ArcaneForce : characterData.SacredForce;

  try {
    for (const forceArea of forceData) {
      const wrapper = createDOMElement('div', forceType === 'arcane' ? 'arcaneWrapper' : 'sacredWrapper');

      const areaName = forceArea.name;

      const areaCode = areaName.replace(/\s+/g, '_').toLowerCase();

      const forceImgSrc = `../../public/assets/${forceType}force/${areaCode}.webp`;

      const forceImgClassName  = `${forceType === 'arcane' ? 'Arcane' : 'Sacred'}Image`;

      const forceImg = await createImageElement(forceImgSrc,areaName, forceImgClassName);

      var level = await setForceLevel(forceArea, characterData, forceImg, forceType);

      const forceLevel = createDOMElement('span', '', level);

      wrapper.appendChild(forceImg);
      wrapper.appendChild(forceLevel);
      outerWrapper.appendChild(wrapper);
    }
  } catch (error) {
    console.error(`Error loading ${forceType === 'arcane' ? 'Arcane' : 'Sacred'} Force:`, error);
    throw error;
  }
  return outerWrapper;
}

async function setForceLevel(forceArea, characterData, forceImg, forceType) {
  let level = forceArea.level;
  const minLevel = dailyJson.find(json => json.name === forceArea.name).minLevel;
  if (characterData.level < minLevel) {
    forceImg.classList.toggle('off');
    level = 0;
  }

  level = level === (forceType === 'arcane' ? 20 : 10) ? 'MAX' : `Lv. ${level}`;

  return level;
}


async function createCharacterPortrait(characterData) {
  const portrait = await createImageElement(`../../public/assets/cards/${getCode(characterData)}.webp`, characterData.class);
  portrait.setAttribute('class', characterData.level === 0 && characterData.name === 'Character Name' ? 'cardPortrait off' : 'cardPortrait');
  
  return portrait;
}

async function createLinkSkillContent(characterData){
    const linkImageLevelDiv = createDOMElement('div', 'linkImageLevel');

    const linkspan = createDOMElement('span', 'linkLegionTitle', 'Link Skill');

    const linkSkillData = await fetch('../../public/data/linkskill.json').then(response => response.json());
    
    const filteredLink = linkSkillData.find(item => item.name === characterData.linkSkill);

    const wrapper = createDOMElement('div', 'linkWrapper');

    const linkImg = await createImageElement(filteredLink.image, filteredLink.name, 'linkImg');


    let LinkLevelText;

    if (characterData.level > 178 && characterData.class === 'Zero') {
      LinkLevelText = 'Lv. 5';
    } else if (characterData.level >= 210 && filteredLink.levels.length > 2) {
      LinkLevelText = 'Lv. 3';
    } else if (characterData.level >= 120) {
      LinkLevelText = 'Lv. 2';
    } else {
      LinkLevelText = 'Lv. 1';
    }
    

    const linkLevel = createDOMElement('span', 'linkLevel',LinkLevelText);

    wrapper.appendChild(linkImg);
    wrapper.appendChild(linkLevel);

    linkImageLevelDiv.appendChild(linkspan);
    linkImageLevelDiv.appendChild(wrapper);

    return linkImageLevelDiv; 
}

async function createLegionContent(characterData){
  const legionDiv = createDOMElement('div', 'legionDiv');

  const legionspan = createDOMElement('span', 'linkLegionTitle', 'Legion');
 
  const legionRank = getRank(characterData);
  const legionSrc = (legionRank === 'no_rank')
    ? '../../public/assets/legion/no_rank.webp'
    : `../../public/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;
  
  const legionImg = await createImageElement(legionSrc, `${characterData.class} legion`, 'legionImg');

  legionDiv.appendChild(legionspan);
  legionDiv.appendChild(legionImg);

  return legionDiv;
}


async function createBossIconAndName(characterData) {
 
  const characterName = createDOMElement('span', 'characterName', characterData.name);

  const nameAndIcon = createDOMElement('div', 'nameAndIcon');

  if (characterData.bossing) {
    const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
    const bossIcon = await loadEditableSVGFile(bossIconpath);
  
    bossIcon.setAttribute('class', 'bossIcon');
    const innerSVG = bossIcon.querySelector('svg');
    innerSVG.setAttribute('width', '38');
    innerSVG.setAttribute('height', '38');

    nameAndIcon.appendChild(bossIcon);
  }
  
  nameAndIcon.appendChild(characterName);

  return nameAndIcon;
}

async function createLowerPart(characterData){
  const nameAndIcon = await createBossIconAndName(characterData);
  const job = createDOMElement('span', 'job', getJob(characterData));

  const { color } = characterData.level >= characterData.targetLevel ? characterColors["complete"] : characterColors[characterData.jobType];

  const levelSpan = createDOMElement('span', 'level', `${characterData.level}/${characterData.targetLevel}`);
  levelSpan.style.color = color;
  
  const nameAndLevel = createDOMElement('div', 'nameAndLevel');

  nameAndLevel.appendChild(nameAndIcon);
  nameAndLevel.appendChild(job);
  nameAndLevel.appendChild(levelSpan);

  return nameAndLevel;
}
