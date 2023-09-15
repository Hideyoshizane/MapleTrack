const path = window.location.pathname;
const segments = path.split('/');
const username = segments[1];
const server = segments[2];
const characterCode = segments[3];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(`/code/${username}/${server}/${characterCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch character data');
    }
    const characterData = await response.json();

    await loadCharacterContent(characterData);

    dailyButtons = document.querySelectorAll('.dailyButton');

  } catch(error){
      console.error('error loading page', error);
  }
}); 

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

async function loadTopButtons(){
  const parentDiv = document.querySelector('.characterData');

  const blockDiv = createDiv('buttonWrapper');

  const increaseAllButon = createButton('Increase all');
  const editButton = createButton('Edit Character');
  
  blockDiv.appendChild(increaseAllButon);
  blockDiv.appendChild(editButton);
  parentDiv.appendChild(blockDiv);
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


function createButton(text) {
  const button = document.createElement('div');
  button.className = text === 'Increase all' ? 'increaseAllButton' : 'editButton';
  button.textContent = text;

  return button;
}

async function loadCharacterNameDiv(characterData){
  const parentDiv = document.querySelector('.characterData');

  const characterInfo = createDiv('nameLinkLegion');
  
  const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
  const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');

  const characterName =  createSpan('characterName', characterData.name);
  
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

  JobDiv.appendChild(JobType);
  JobDiv.appendChild(JobLevel);

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

  linkSkillData = await fetch('../../public/data/linkskill.json').then(response => response.json());
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
  ? '../../public/assets/legion/no_rank.webp'
  : `../../public/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;

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

  const levelNumber = createSpan('levelNumber',`${characterData.level}/${characterData.targetLevel}`);

  const levelDiv = createDiv('levelDiv');

  const levelBar = createProgressBar(characterData, characterData.level, characterData.targetLevel, 800, 32, 28);

  levelDiv.appendChild(level);
  levelDiv.appendChild(levelNumber);

  parentDiv.appendChild(levelDiv);
  parentDiv.appendChild(levelBar);
}

function setStyle(element, characterData) {
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

    const icon = await createImageElement(`../../public/assets/${forceType.toLowerCase()}/${areaCode}.webp`, areaName, `${forceType}Image`);
      if (characterData.level < force.minLevel) {
          icon.classList.add('off');
          forceLevel = 0;
      }

    forceWrapper.appendChild(icon);

    const jsonPath = isArcane ? '../../public/data/arcaneforceexp.json' : '../../public/data/sacredforceexp.json';
    const expTable = await fetch(jsonPath).then(response => response.json());
    
    const levelWrapper = createDiv('levelWrapper');

    const level = createSpan(`${forceType}Level`, `Level: ${forceLevel}`);

    levelWrapper.appendChild(level);

    if (characterData.level >= force.minLevel) {
      const expContent = createExpText(force, expTable, isArcane);
      levelWrapper.appendChild(expContent);
    }

    let expTotal = (isArcane && force.level === 20) || (!isArcane && force.level === 11)
    ? force.exp
    : expTable.level[force.level].EXP;

    const expBar = createProgressBar(characterData, force.exp, expTotal , 195, 8, 4, true, true); 

    const forceDataElement = createDiv(`${forceType}Data`);
    forceDataElement.appendChild(levelWrapper);
    forceDataElement.appendChild(expBar);

    if (characterData.level >= force.minLevel) {
      const daysToMax = await returnDaysToMax(force, expTable, characterData, isArcane);
      const wrap = createDiv();
      wrap.style.display = 'flex';
      wrap.style.justifyContent = 'space-between';

      const dailyButton = createDailyButton(force, characterData, isArcane);
      wrap.appendChild(dailyButton);
      if(isArcane){
        const weeklyButton = createWeeklyButton(force, characterData, isArcane);
        wrap.appendChild(weeklyButton);
      }
    
      forceDataElement.appendChild(daysToMax);
      forceDataElement.appendChild(wrap);
      
    } else {
      const unlockText = createSpan('unlockText', `Unlock at Level ${force.minLevel}`);
      forceDataElement.appendChild(unlockText);
    }

    forceWrapper.appendChild(forceDataElement);
    forceGrid.appendChild(forceWrapper);
  }
  forceDiv.appendChild(forceGrid);
  parentDiv.appendChild(forceDiv);
}

async function createImageElement(src, alt, className = '') {
  const image = document.createElement('img');
  image.src = src;
  image.alt = alt;
  if (className) {
      image.classList.add(className);
  }
  await image.decode();
  return image;
}

function createExpText(Force, expTable, isArcane = false){
    const exp = document.createElement('span');
    exp.className = 'exp';
    exp.innerText = 'EXP:';
    let expNumber;

    if((isArcane && Force.level < 20) || (!isArcane && Force.level < 11)){
      const nextLevelEXP = expTable.level[Force.level].EXP;
    
      expNumber = createSpan('expNumber', `${Force.exp}/${nextLevelEXP}`);
      expNumber.setAttribute('expAmount',Force.exp);
      expNumber.setAttribute('nextLevelEXP',nextLevelEXP);
    } else{
      expNumber = createSpan('expNumber', `MAX`);
    }
    
    const wrap = createDiv();

    wrap.appendChild(exp);
    wrap.appendChild(expNumber);

    return wrap;
}

function createProgressBar(characterData, current, total, maxWidth, outerHeight, innerHeight, isArcane = false, isForce = false) {
  const outerDiv = createDiv('OuterEXPBar');
  outerDiv.style.width = `${maxWidth}px`;
  outerDiv.style.height = `${outerHeight}px`;

  const innerDiv = createDiv('InnerEXPBar');
  innerDiv.style.height = `${innerHeight}px`;
  if (current == 0) {
    innerDiv.style.width = 0;
  } else {
    let barSize = (current / total) * maxWidth;
    if ((isArcane && total.level === 20) && isForce) {
      barSize = maxWidth;
    } else if ((!isArcane && total.level === 11 ) && isForce) {
      barSize = maxWidth;
    }
    
    if(barSize >= maxWidth)
      barSize = (maxWidth - 4);

    innerDiv.style.width = `${barSize}px`;
  }

  setStyle(innerDiv, characterData);
  outerDiv.appendChild(innerDiv);
  return outerDiv;
}

async function returnDaysToMax(Force, expTable, characterData, isArcane = false){

  let totalExp = calculateTotalExp(Force.level, expTable);
  let dailyExp = getDailyValue(Force, characterData, isArcane);
  const weeklyExp = (Force.content[1].checked && isArcane) ? 45 : 0;
  totalExp -= Force.exp;
  
  let daysToReachTotalExp = Math.ceil(totalExp / (dailyExp + (weeklyExp / 7)));
  if(daysToReachTotalExp < 0)
    daysToReachTotalExp = 0;
  
  const daysToMax = createSpan('daysToMax', isArcane ? `Days to Level 20: ${daysToReachTotalExp}` : `Days to Level 11: ${daysToReachTotalExp}`);

  return daysToMax;
}

function calculateTotalExp(forceLevel, expTable) {
  let totalExp = 0;
  for (let level = forceLevel; level <= Object.keys(expTable.level).length; level++) {
      if (expTable.level[level]) {
          totalExp += expTable.level[level].EXP;
      }
  }
  return totalExp;
}

function createDailyButton(Force, characterData, isArcane = false){
  const dailyValue = getDailyValue(Force, characterData, isArcane);
  const dailyButton = createDiv('dailyButton', `Daily: + ${dailyValue}`);
  dailyButton.setAttribute('value', dailyValue);
  return dailyButton;
}

function getDailyValue(Force, characterData, isArcane = false){
  let dailyValue = Force.content[0].expGain;

  if(isArcane){
    if(Force.content[2] && Force.content[2].checked == true){
      if(characterData.level >= Force.content[2].minLevel){
        dailyValue *= 2;
      }
    }
  }
      
  if(!isArcane && Force.name === 'Cernium'){
    if(Force.content[1].checked == true){
      dailyValue += Force.content[1].expGain;
    }
  }
  return dailyValue;
}

function createWeeklyButton(Force){
  const weeklyButton = createDiv('weeklyButton', `Weekly: ${Force.content[1].tries}/3`);
  weeklyButton.setAttribute('tries', Force.content[1].tries);

  return weeklyButton;
}