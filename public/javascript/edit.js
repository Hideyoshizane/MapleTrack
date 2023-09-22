const path = window.location.pathname;
const segments = path.split('/');
const username = segments[1];
const server = segments[2];
const characterCode = segments[3];

window.CharacterData;

const { DateTime } = luxon;

document.addEventListener('DOMContentLoaded', async () => {
  
    characterData = await fetchCharacterData(username, server, characterCode);
    
    await loadCharacterContent(characterData);

    discardButton = document.querySelector('.discardButton');
    discardButton.addEventListener('click', () => {
      var url = `/${username}/${server}/${characterCode}`;
      window.location.href = url;
      });

    const levelNumber = document.querySelector('.levelNumber');
    const levelTarget = document.querySelector('.levelTarget');

    levelNumber.addEventListener('input', async () => {
      const levelNumberValue = levelNumber.value;
      const levelTargetValue = levelTarget.value;
      await updateExpBar(levelNumberValue, levelTargetValue);
      await updateClass(levelNumberValue);
      await updateLegion(levelNumberValue);
    });

    levelNumber.addEventListener('blur', async function(event){
      const level = event.target.value;
      await updateForce('Arcane', level);
      await updateForce('Sacred', level);
    });

    levelTarget.addEventListener('input', async () => {
      const levelNumberValue = levelNumber.value;
      const levelTargetValue = levelTarget.value;
      await updateExpBar(levelNumberValue, levelTargetValue);
      await updateClass(levelNumberValue);
    });

    saveButton = document.querySelector('.saveButton');
    saveButton.addEventListener('click', async (event) =>{
      console.log('hi');
      await saveDataAndPost();
      //var url = `/${username}/${server}/${characterCode}`;
      //window.location.href = url;
    });


 /*   increaseAllButton = document.querySelector('.increaseAllButton');
    increaseAllButton.addEventListener('click', (event) => {
      dailyButtons.forEach((button) => {
        if (!button.disabled) 
          button.click();
      })
    });

    editButton = document.querySelector('.editButton');
    editButton.addEventListener('click', (event) => {
      console.log('hi');
    });*/
}
); 

async function fetchCharacterData(username, server, characterCode){
  try {
    const response = await fetch(`/code/${username}/${server}/${characterCode}`);
    const characterData = await response.json();
    return characterData;
  } catch (error) {
    console.error('Error fetching character data:', error);
  }
}

async function loadCharacterContent(characterData) {
  await loadCharacterImage(characterData);
  await loadTopButtons();
  await loadCharacterNameDiv(characterData);
  await loadLevelAndLevelBar(characterData);
  await loadForce(characterData, true);
  await loadForce(characterData, false);
}

async function loadCharacterImage(characterData) {
  const parentDiv = document.querySelector('.classImage');

  const image = await createImageElement(`../../public/assets/profile/${characterData.code}.webp`, `${characterData.class} profile picture`, `portraitImage`);
  parentDiv.appendChild(image);
};

function createButton(className, content){
  const button = document.createElement('button');

  if (className) {
    button.classList.add(className);
  }

  if (content !== undefined) {
    button.textContent = content;
  }

  return button;
}

function createDiv(className, content) {
  const div = document.createElement('div');

  if (className) {
    div.classList.add(className);
  }

  if (content !== undefined) {
    div.textContent = content;
  }

  return div;
}

function createInput(className, content){
  const input = document.createElement('input');

  if (className) {
    input.classList.add(className);
  }

  if (content !== undefined) {
    input.placeholder  = content;
  }

  return input;

}

function createSpan(className, content) {
  const span = document.createElement('span');

  if (className) {
    span.classList.add(className);
  }

  if (content !== undefined) {
    span.textContent  = content;
  }

  return span;
}

function createCheckboxWithLabel(className, labelText, checked) {
  const container = document.createElement('label');
  container.classList.add(className);

  const checkboxElement = document.createElement('input');
  checkboxElement.type = 'checkbox';
  checkboxElement.checked = checked;

  const textSpan = createSpan(null, labelText);

  container.appendChild(checkboxElement);
  container.appendChild(textSpan);

  return container;
}

function createSwitchButton(className, bossing){
  const switchContainer = document.createElement('label');
  switchContainer.classList.add(className);

  const inputCheckbox = document.createElement('input');
  inputCheckbox.type = 'checkbox';
  inputCheckbox.checked = bossing;

  const slider = document.createElement('span'); 
  slider.classList.add('slider');

  switchContainer.appendChild(inputCheckbox);
  switchContainer.appendChild(slider);

  return switchContainer;
}


async function loadTopButtons(){
  const parentDiv = document.querySelector('.characterData');

  const blockDiv = createDiv('buttonWrapper');

  const discardButton = createButton('discardButton','Discard Changes');
  const saveButton = createButton('saveButton','Save Changes');
  
  blockDiv.appendChild(discardButton);
  blockDiv.appendChild(saveButton);
  parentDiv.appendChild(blockDiv);
}


async function loadCharacterNameDiv(characterData){
  const parentDiv = document.querySelector('.characterData');

  const characterInfo = createDiv('nameLinkLegion');
  
  const bossIconpath = '../../../public/assets/icons/menu/boss_slayer.svg';
  const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');

  const characterName =  createInput('characterName', characterData.name);
  
  const characterIconDiv = createDiv('characterIconDiv');

  characterIconDiv.appendChild(bossIcon);
  characterIconDiv.appendChild(characterName);

  characterInfo.appendChild(characterIconDiv);

  const linkLegionClassJob = createDiv('linkLegionClassJob');

  const linkSkill = await loadLinkSkillDiv(characterData);
  const legion = await loadLegionDiv(characterData);

  const JobType = createSpan('classType', characterData.class);

  const JobLevel = createSpan('jobLevel', characterData.job);

  const JobDiv = createDiv('jobDiv');

  const bossText = createSpan('bossText', 'Bossing Character');
  const switchButton = createSwitchButton('bossSwitch',characterData.bossing);

  const bossArea = createDiv('bossArea');

  JobDiv.appendChild(JobType);
  JobDiv.appendChild(JobLevel);
  bossArea.appendChild(bossText);
  bossArea.appendChild(switchButton);

  linkLegionClassJob.appendChild(bossArea);
  linkLegionClassJob.appendChild(linkSkill);
  linkLegionClassJob.appendChild(legion);
  linkLegionClassJob.appendChild(JobDiv);
  
  characterInfo.appendChild(linkLegionClassJob);
  parentDiv.appendChild(characterInfo);
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

    return svgElement;

  } catch (error) {
    console.error("Error loading SVG file:", error);
    return null;
  }
}

async function loadLinkSkillDiv(characterData){
  const linkspan = createSpan('linkLegionTitle', 'Link Skill');

  linkSkillData = await fetch('../../../public/data/linkskill.json').then(response => response.json());
  filteredLink = linkSkillData.find(item => item.name === characterData.linkSkill);

  const linkImg = await createImageElement(filteredLink.image, filteredLink.name, `linkImg`);
 
  const linkSkillBlock = createDiv('linkSkillBlock');

  linkSkillBlock.appendChild(linkspan);
  linkSkillBlock.appendChild(linkImg);

  return linkSkillBlock;

}

async function loadLegionDiv(characterData) {
  legionData = await fetch('../../public/data/legionsystems.json').then(response => response.json());
  filterLegion = legionData.find(item => item.name === characterData.legion);

  const legionspan = createSpan('linkLegionTitle', 'Legion');

  let legionRank = getRank(characterData);
  const legionImgSrc = legionRank === 'no_rank'
  ? '../../../public/assets/legion/no_rank.webp'
  : `../../../public/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;

  const legionImg = await createImageElement(legionImgSrc, `${characterData.class} legion`, 'legionImg');

  const legionBlock = createDiv('legionBlock');

  legionBlock.appendChild(legionspan);
  legionBlock.appendChild(legionImg);

  return legionBlock;
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

async function loadLevelAndLevelBar(characterData){
  const parentDiv = document.querySelector('.characterData');

  const level = createSpan('level', 'Level');

  const levelNumber = createInput('levelNumber',`${characterData.level}`);
  const levelTarget = createInput('levelTarget', `${characterData.targetLevel}`);
  const Bar = createSpan('Bar', '/');

  const levelDiv = createDiv('levelDiv');

  const levelBar = createProgressBar(characterData, characterData.level, characterData.targetLevel, 800, 32, 28);

  levelDiv.appendChild(level);
  levelDiv.appendChild(levelNumber);
  levelDiv.appendChild(Bar);
  levelDiv.appendChild(levelTarget);

  parentDiv.appendChild(levelDiv);
  parentDiv.appendChild(levelBar);
}

function createProgressBar(characterData, current, total, maxWidth, outerHeight, innerHeight, isArcane = false, isForce = false) {
  const outerDiv = createDiv('OuterEXPBar');
  outerDiv.style.width = `${maxWidth}px`;
  outerDiv.style.height = `${outerHeight}px`;
  outerDiv.setAttribute('jobType', characterData.jobType);

  const innerDiv = createDiv('InnerEXPBar');
  innerDiv.style.height = `${innerHeight}px`;
  let barSize = (current / total) * maxWidth;
    if ((isArcane && total.level === 20) && isForce) {
      barSize = maxWidth;
    } else if ((!isArcane && total.level === 11 ) && isForce) {
      barSize = maxWidth;
    }
    
    if(barSize >= maxWidth)
      barSize = (maxWidth - 4);
    if(current === 0 && total === 0 ){
      barSize = (maxWidth - 4);
    }

  innerDiv.style.width = `${barSize}px`;
 
  setStyle(innerDiv, characterData.jobType, current, total);
  outerDiv.appendChild(innerDiv);
  return outerDiv;
}

function setStyle(element, jobType, currentLevel, targetLevel) {
  let value;

  switch (jobType) {
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

  if (currentLevel >= targetLevel) {
    value = '#48AA39';
  }

  element.style.backgroundColor = value;
}

async function loadForce(characterData, isArcane){
  const parentDiv = document.querySelector('.characterData');

  const forceType = isArcane ? 'ArcaneForce' : 'SacredForce';
  const forceData = characterData[forceType];

  const Title = createSpan(forceType, isArcane ? 'Arcane Force' : 'Sacred Force');

  const forceDiv = createDiv(`${forceType}Div`);
  forceDiv.appendChild(Title);

  const forceGrid = createDiv(`${forceType}Grid`);

  for(force of forceData){
    const forceWrapper = createDiv(`${forceType}Wrapper`);

    const areaName = force.name;
    const areaCode = areaName.replace(/\s+/g, '_').toLowerCase();
    let forceLevel = force.level;

    const icon = await createImageElement(`../../../public/assets/${forceType.toLowerCase()}/${areaCode}.webp`, areaName, `${forceType}Image`);
      if (characterData.level < force.minLevel) {
          icon.classList.add('off');
          forceLevel = 0;
          forceWrapper.classList.add('off');
      }

    forceWrapper.appendChild(icon);

    const jsonPath = isArcane ? '../../../public/data/arcaneforceexp.json' : '../../../public/data/sacredforceexp.json';
    const expTable = await fetch(jsonPath).then(response => response.json());
    
    const levelWrapper = createDiv('levelWrapper');

    const level = createSpan(`${forceType}Level`, `Level:`);
    const levelInput = createInput('levelInput', `${force.level}`);

    levelWrapper.appendChild(level);
    let checkboxContent = createDiv('checkboxContent');
    if(characterData.level >= force.minLevel){
      levelWrapper.appendChild(levelInput);
      const expContent = createSpan('expContent', 'EXP:');
      const expInput = createInput('expInput', `${force.exp}`);
      levelWrapper.appendChild(expContent);
      levelWrapper.appendChild(expInput);

      for(forceContent of force.content){
        const checkbox = createCheckboxWithLabel('forceCheckbox', `${forceContent.contentType}`, forceContent.checked);
        checkboxContent.appendChild(checkbox);
      }
    }
    else{
      level.textContent = 'Level: 0';
    }

    const forceDataElement = createDiv(`${forceType}Data`);
    forceDataElement.setAttribute('area', areaName);
    forceDataElement.appendChild(levelWrapper);
    if(characterData.level >= force.minLevel){
      forceDataElement.appendChild(checkboxContent);
    }
    if((isArcane && force.level < 20) || (!isArcane && force.level < 11)){
      if (characterData.level < force.minLevel) {
        const unlockText = createSpan('unlockText', `Unlock at Level ${force.minLevel}`);
        forceDataElement.appendChild(unlockText);
      }
    }

    forceWrapper.appendChild(forceDataElement);
    forceGrid.appendChild(forceWrapper);
  }
  forceDiv.appendChild(forceGrid);
  parentDiv.appendChild(forceDiv);
}

async function createImageElement(src, alt, className = '') {
  try{
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    if (className) {
        image.classList.add(className);
    }
    await image.decode();
    return image;

  } catch(error){
    console.error(error);
  }
}

function createExpText(Force, expTable, isArcane = false){
    const exp = document.createElement('span');
    exp.className = 'exp';
    exp.innerText = 'EXP:';
    let expNumber;

    if((isArcane && Force.level < 20) || (!isArcane && Force.level < 11)){
      const nextLevelEXP = expTable.level[Force.level].EXP;
    
      expNumber = createSpan('expNumber', `${Force.exp}/${nextLevelEXP}`);
    } else{
      expNumber = createSpan('expNumber', `MAX`);
    }
    
    const wrap = createDiv();

    wrap.appendChild(exp);
    wrap.appendChild(expNumber);

    return wrap;
}

async function updateExpBar(levelNumberValue, levelTargetValue) {
  const outerDiv = document.querySelector('.OuterEXPBar');
  const innerExpBar = document.querySelector('.InnerEXPBar');
  const jobType = outerDiv.getAttribute('jobType');
  let levelValue = Number(levelNumberValue);
  let targetValue = Number(levelTargetValue);
  maxWidth = 796;

  let barSize = (levelValue / targetValue) * maxWidth;
  if(levelValue >= targetValue) {
    innerExpBar.style.backgroundColor = '#48AA39';
  }
  else{
    setStyle(innerExpBar, jobType, levelValue, targetValue);
  }
  innerExpBar.style.width = barSize + 'px';
}

async function updateClass(levelNumberValue){
  const level = Number(levelNumberValue);
  targetSpan = document.querySelector('.jobLevel');
   if(level < 30){
    targetSpan.textContent = '1st Class';
   }
   if(level >= 30 && level < 60){
    targetSpan.textContent = '2nd Class';
   }
   if(level >= 60 && level < 100){
    targetSpan.textContent = '3rd Class';
   }
   if(level >= 100 && level < 200){
    targetSpan.textContent = '4th Class';
   }
   if(level >= 200){
    targetSpan.textContent = 'V Class';
   }
}

async function updateLegion(levelNumberValue){
  const level = Number(levelNumberValue);
  const data = {level, characterCode};
  const rank = getRank(data);
  targetImage = document.querySelector('.legionImg');
  targetImage.src = rank === 'no_rank'
  ? '../../../public/assets/legion/no_rank.webp'
  : `../../../public/assets/legion/${characterData.jobType}/rank_${rank}.webp`;
}

async function updateForce(type, levelNumberValue) {
  const level = Number(levelNumberValue);
  const forceWrapper = document.querySelectorAll(`.${type}ForceWrapper`);
  
  for (const force of forceWrapper) {
    const areaDiv = force.querySelector(`.${type}ForceData`);
    const areaName = areaDiv.getAttribute('area');
    const image = force.querySelector(`.${type}ForceImage`);
    const areaData = characterData[`${type}Force`].filter(force => force.name === areaName);

    if (level < areaData[0].minLevel && !force.classList.contains('off')) {
      image.classList.add('off');
      force.classList.add('off');
      const levelWrapper = force.querySelector('.levelWrapper');
      const wrap = createDiv('levelWrapper');
      const level = createSpan(`${type}ForceLevel`, `Level: 0`);
      wrap.appendChild(level);
      levelWrapper.replaceWith(wrap);

      const checkboxContent = force.querySelector('.checkboxContent');
      const unlockText = createSpan('unlockText', `Unlock at Level ${areaData[0].minLevel}`);
      checkboxContent.replaceWith(unlockText);
    }

    if (level >= areaData[0].minLevel && force.classList.contains('off')) {
      image.classList.remove('off');
      force.classList.remove('off');
      const levelWrapper = force.querySelector('.levelWrapper');
      const wrap = createDiv('levelWrapper');
      const level = createSpan(`${type}ForceLevel`, `Level:`);
      const levelInput = createInput('levelInput', `${areaData[0].level}`);
      const expContent = createSpan('expContent', 'EXP:');
      const expInput = createInput('expInput', `${areaData[0].exp}`);
      wrap.appendChild(level);
      wrap.appendChild(levelInput);
      wrap.appendChild(expContent);
      wrap.appendChild(expInput);
      levelWrapper.replaceWith(wrap);

      const unlockText = areaDiv.querySelector('.unlockText');
      let checkboxContent = createDiv('checkboxContent');
      for (const forceContent of areaData[0].content) {
        const checkbox = createCheckboxWithLabel('forceCheckbox', `${forceContent.contentType}`, forceContent.checked);
        checkboxContent.appendChild(checkbox);
      }
      unlockText.replaceWith(checkboxContent);
    }
  }
}

async function saveDataAndPost(){
  
}

/*
async function postRequest(postData){
  fetch(URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
})
}
*/