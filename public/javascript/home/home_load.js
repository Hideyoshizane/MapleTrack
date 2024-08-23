window.cardBody;
window.username;
window.dailyJson;
window.SymbolsImages;
window.linkSkillData;

document.addEventListener('DOMContentLoaded', async () => {
  try {

    username = document.getElementById('userdata').getAttribute('data-username');

    dailyJson = await fetch('/../../../public/data/dailyExp.json').then((response) => response.json());

    await loadSymbolsImage();

    linkSkillData = await fetch('../../public/data/linkskill.json').then(response => response.json());
    
    const data = await fetch('/userServer').then(response => response.json());

    const dropdown = document.querySelector('.dropdown');
    await loadServerButtons(data, dropdown);
    
    startLoader();
    await createCharacterCards();

    document.dispatchEvent(new Event('PageLoaded'));

  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});

async function loadSymbolsImage() {
  SymbolsImages = {
    'vanish_journey': await createImageElement('../../public/assets/arcaneforce/vanish_journey.webp', 'Vanish Journey', 'ArcaneImage'),
    'chu_chu_island': await createImageElement('../../public/assets/arcaneforce/chu_chu_island.webp', 'Chu Chu Island', 'ArcaneImage'),
    'lachelein': await createImageElement('../../public/assets/arcaneforce/lachelein.webp', 'Lachelein', 'ArcaneImage'),
    'arcana': await createImageElement('../../public/assets/arcaneforce/arcana.webp', 'Arcana', 'ArcaneImage'),
    'morass': await createImageElement('../../public/assets/arcaneforce/morass.webp', 'Morass', 'ArcaneImage'),
    'esfera': await createImageElement('../../public/assets/arcaneforce/esfera.webp', 'Esfera', 'ArcaneImage'),
    'cernium': await createImageElement('../../public/assets/sacredforce/cernium.webp', 'Cernium', 'SacredImage'),
    'arcus': await createImageElement('../../public/assets/sacredforce/arcus.webp', 'Arcus', 'SacredImage'),
    'odium': await createImageElement('../../public/assets/sacredforce/odium.webp', 'Odium', 'SacredImage'),
    'shangri-la': await createImageElement('../../public/assets/sacredforce/shangri-la.webp', 'Shangri-la', 'SacredImage'),
    'arteria': await createImageElement('../../public/assets/sacredforce/arteria.webp', 'Arteria', 'SacredImage'),
    'carcion': await createImageElement('../../public/assets/sacredforce/carcion.webp', 'Carcion', 'SacredImage')
  };
}

function startLoader(){
  const parentDiv = document.querySelector('.characterCards');
  const loader = createDOMElement('span', 'loader');
  loader.style.marginTop = '250px'; 
  parentDiv.appendChild(loader);
}

async function createCharacterCards(){
  const parentDiv = document.querySelector('.characterCards');
  const selectedServer = document.querySelector('.SelectedButton').querySelector('span').innerText;


  const characters = await fetch(`/${username}/${selectedServer}`).then(response => response.json());
  const characterCards = await Promise.all(characters.map(generateCard));

  const characterCardFragment = document.createDocumentFragment();

  await sort(characterCards);
  
  characterCards.forEach((card) => {
    characterCardFragment.appendChild(card);
  });

  const loaderSpan = parentDiv.querySelector('.loader');
  if(loaderSpan)
    parentDiv.removeChild(loaderSpan);

  parentDiv.appendChild(characterCardFragment);
  filterCharacterCards(selectedValues);

  cardBody = document.querySelectorAll('.cardBody');
}

async function sort(cards) {
  const customOrder = ['mage', 'thief', 'xenon', 'warrior', 'bowman', 'pirate', 'bossing'];

  cards.sort((a, b) => {
    const jobTypeA = a.getAttribute('jobtype');
    const jobTypeB = b.getAttribute('jobtype');
    const characterCardA = a.getAttribute('characterclass');
    const characterCardB = b.getAttribute('characterclass');

    if (jobTypeA && jobTypeB && characterCardA && characterCardB) {
      if (jobTypeA !== 'bossing' && jobTypeB !== 'bossing') {
        const indexA = customOrder.indexOf(jobTypeA);
        const indexB = customOrder.indexOf(jobTypeB);

        if (indexA !== -1 && indexB !== -1) {
          const orderByCustomOrder = indexA - indexB;
          if (orderByCustomOrder !== 0) {
            return orderByCustomOrder;
          }
          return characterCardA.localeCompare(characterCardB);
        }
      }
    }

    return 0;
  });
}


function filterCharacterCards(selectedValues){
  document.querySelectorAll('.cardBody').forEach((element) => {
    const jobType = element.getAttribute('jobType');
    const hasBossIcon = element.querySelector('.bossIcon');

    const isThiefOrPirate = selectedValues.includes('thief') || selectedValues.includes('pirate');

    
    if (!selectedValues.includes(jobType) && !(isThiefOrPirate && jobType === 'xenon'))
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
  const levelBar = await createLeveLBar(levelBarData, 25, 'levelBar');

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

      const areaCode = forceArea.name.replace(/\s+/g, '_').toLowerCase();
          
      const forceImg = SymbolsImages[areaCode].cloneNode(true);
      
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

  level = level === (forceType === 'arcane' ? 20 : 11) ? 'MAX' : `Lv. ${level}`;

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

let bossIcon;

async function loadBossIcon(){
  const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
  bossIcon = await loadEditableSVGFile(bossIconpath);
  bossIcon.setAttribute('class', 'bossIcon');
  const innerSVG = bossIcon.querySelector('svg');
  innerSVG.setAttribute('width', '38');
  innerSVG.setAttribute('height', '38');

}

async function createBossIconAndName(characterData) {
 
  const characterName = createDOMElement('span', 'characterName', characterData.name);
  const nameAndIcon = createDOMElement('div', 'nameAndIcon');

  if (!bossIcon) {
    await loadBossIcon();
  }

  if (characterData.bossing) {
    nameAndIcon.appendChild(bossIcon.cloneNode(true));
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
