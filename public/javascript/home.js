window.cardBody;
window.username;

document.addEventListener('DOMContentLoaded', async () => {
  try {

    username = document.getElementById('userdata').getAttribute('data-username');

    const data = await fetch('/userServer').then(response => response.json());
    const mainContent = document.querySelector('.mainContent');
    await loadServerButtons(data, mainContent);

    setupDropdownToggle();
  
    const characterCardDiv = document.querySelector('.characterCards');
    const selectedButton = dropdownToggle.querySelector('.SelectedButton');
    await createCharacterCards();
  
    const serverButtons = document.querySelector('.serverSelector').querySelectorAll('.serverButton');     
    serverButtons.forEach(serverButton => {
      serverButton.addEventListener('click', async () => {
        await handleServerButtonClick(serverButton, serverButtons, selectedButton, characterCardDiv);
      });
    });

    setupCardClickListeners();
    
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});


async function handleServerButtonClick(serverButton, serverButtons, selectedButton, characterCardDiv) {
  serverButtons.forEach(button => {
    if (button !== serverButton) {
      button.classList.add('notSelected');
      button.classList.remove('selected');
    }
    cardBody = document.querySelectorAll('.cardBody');
  });

  swapContentAndStoreCookie(selectedButton, serverButton);
  serverButton.classList.toggle('notSelected');
  serverButton.classList.toggle('selected');

  characterCardDiv.innerHTML = '';
  await createCharacterCards();
  setupCardClickListeners();
}

function setupCardClickListeners() {
  cardBody.forEach((card) => {
    card.addEventListener('click', cardClickRedirect);
  });
}

function cardClickRedirect(){
  const server = document.querySelector('.SelectedButton').querySelector('span').innerText;
  const character = this.getAttribute('characterclass');

  var url = `${username}/${server}/${character}`;
  window.location.href = url;
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

async function updateSelectedValuesCookie() {
    sort(selectedValues, true);
    const selectedValuesString = selectedValues.join(',');
    setCookie('filterValues', selectedValuesString, 7);
}

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
    const jobType = element.getAttribute('job-type');
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
  const levelBarWrapper = await createLeveLBar(characterData);


  const cardBody = createDOMElement('div', 'cardBody');

  cardBody.setAttribute('job-type', characterData.jobType);
  cardBody.setAttribute('characterClass', characterData.code);

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
      const forceImgAlt = areaName;
      const forceImgClassName  = `${forceType === 'arcane' ? 'Arcane' : 'Sacred'}Image`;

      const forceImg = await createImageElement(forceImgSrc,forceImgAlt, forceImgClassName);

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

async function setForceLevel(forceArea, characterData, forceImg, forceType){
  let level = forceArea.level;
      if (characterData.level < forceArea.minLevel) {
        forceImg.classList.toggle('off');
        level = 0;
      }
      if (level === (forceType === 'arcane' ? 20 : 10)) {
        level = 'MAX';
      } else {
        level = 'Lv. ' + level;
      }
  return level;
}

async function createCharacterPortrait(characterData){

  const portrait = await createImageElement(`../../public/assets/cards/${characterData.code}.webp`, characterData.class);

  if(characterData.level === 0 && characterData.name === 'Character Name'){
    portrait.setAttribute('class', 'cardPortrait off');
  }
  else{
    portrait.setAttribute('class', 'cardPortrait');
  }

  return portrait;
}

async function createLinkSkillContent(characterData){
    const linkImageLevelDiv = createDOMElement('div', 'linkImageLevel');

    const linkspan = createDOMElement('span', 'linkLegionTitle', 'Link Skill');

    linkSkillData = await fetch('../../public/data/linkskill.json').then(response => response.json());
    filteredLink = linkSkillData.find(item => item.name === characterData.linkSkill);

    const wrapper = createDOMElement('div', 'linkWrapper');

    const linkImg = await createImageElement(filteredLink.image, filteredLink.name, 'linkImg');

    
    let LinkLevelText;
    switch (true) {
      case characterData.level > 178 && characterData.code === 'zero':
        LinkLevelText = 'Lv. 5';
        break;
      case characterData.level >= 210 && filteredLink.levels.length > 2:
        LinkLevelText = 'Lv. 3';
        break;
      case characterData.level >= 120:
        LinkLevelText = 'Lv. 2';
        break;
      default:
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

  legionData = await fetch('../../public/data/legionsystems.json').then(response => response.json());
  filterLegion = legionData.find(item => item.name === characterData.legion);

  let legionRank = getRank(characterData);
  let legionSrc;
  if(legionRank == 'no_rank'){
    legionSrc = '../../public/assets/legion/no_rank.webp';
  }
  else{
    legionSrc = `../../public/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;
  }

  const legionImg = await createImageElement(legionSrc, `${characterData.class} legion`, 'legionImg');

  legionDiv.appendChild(legionspan);
  legionDiv.appendChild(legionImg);

  return legionDiv;
}

function getRank(characterData) {
  const { level, code } = characterData;

  if (code === 'zero') {
    if (level >= 130 && level <= 159) return 'b';
    if (level >= 160 && level <= 179) return 'a';
    if (level >= 180 && level <= 199) return 's';
    if (level >= 200 && level <= 249) return 'ss';
    if (level >= 250) return 'sss';
  } else {
    if (level >= 60 && level <= 99) return 'b';
    if (level >= 100 && level <= 139) return 'a';
    if (level >= 140 && level <= 199) return 's';
    if (level >= 200 && level <= 249) return 'ss';
    if (level >= 250) return 'sss';
  }

  return 'no_rank';
}

async function createBossIconAndName(characterData) {
  const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
  const bossIcon = await loadEditableSVGFile(bossIconpath);

  bossIcon.setAttribute('class', 'bossIcon');
  const innerSVG = bossIcon.querySelector('svg');
  innerSVG.setAttribute('width', '38');
  innerSVG.setAttribute('height', '38');

  const characterName = createDOMElement('span', 'characterName', characterData.name);

  const nameAndIcon = createDOMElement('div', 'nameAndIcon');

  if (characterData.bossing) {
    nameAndIcon.appendChild(bossIcon);
  }
  
  nameAndIcon.appendChild(characterName);

  return nameAndIcon;
}

async function createLowerPart(characterData){
  const nameAndIcon = await createBossIconAndName(characterData);
  const job = createDOMElement('span', 'job', characterData.job);

  const levelSpan = createDOMElement('span', 'level', `${characterData.level}/${characterData.targetLevel}`);

  setStyle(levelSpan, characterData, true);
  
  const nameAndLevel = createDOMElement('div', 'nameAndLevel');

  nameAndLevel.appendChild(nameAndIcon);
  nameAndLevel.appendChild(job);
  nameAndLevel.appendChild(levelSpan);

  return nameAndLevel;
}

async function createLeveLBar(characterData){

  const levelBarWrapper = createDOMElement('div', 'levelBarWrapper');
  const levelBar = createDOMElement('div', 'levelBar');

  const progressBar = createDOMElement('div', 'progressBar');
  if(characterData.level == 0){
    progressBar.style.width = 0;
  }
  else{
    const maxWidth = 480;
    let BarSize = (characterData.level / characterData.targetLevel) * maxWidth;

    if(BarSize > maxWidth){
      BarSize = maxWidth;
    }
    progressBar.style.width = BarSize + 'px';
  }

  setStyle(progressBar, characterData, false); 

  levelBar.appendChild(progressBar);
  levelBarWrapper.appendChild(levelBar);
  return levelBarWrapper;
}

function setStyle(element, characterData, isColor) {
  let styleProperty;
  let value;

  switch (characterData.jobType) {
    case 'mage':
      value = '#92BCE3';
      break;

    case 'thief':
    case 'xenon':
      value = '#B992E3';
      break;
    
    case 'warrior':
      value = '#E39294';
      break;

    case 'bowman':
      value = '#96E4A5';
      break;

    case 'pirate':
      value = '#E3C192';
      break;
  }

  if (characterData.level >= characterData.targetLevel) {
    value = '#48AA39';
  }

  if (isColor) {
    styleProperty = 'color';
  } else {
    styleProperty = 'backgroundColor';
  }

  element.style[styleProperty] = value;
}