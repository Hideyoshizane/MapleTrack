const path = window.location.pathname;
const segments = path.split('/');
const username = segments[1];
const server = segments[2];
const characterCode = segments[3];

window.CharacterData;

document.addEventListener('DOMContentLoaded', async () => {
  characterData = await fetchCharacterData(username, server, characterCode);
  await loadCharacterContent(characterData);

  let dailyButtons = document.querySelectorAll('.dailyButton');
  if(dailyButtons.length > 0) {
    dailyButtons.forEach((dailyButton) => {
      dailyButton.addEventListener('click', async (event) => {
        if (!dailyButton.disabled) {
          await increaseDaily(event, characterData);
        }
      });
    });
  }

  weeklyButtons = document.querySelectorAll('.weeklyButton');
  if(weeklyButtons.length > 0){
    weeklyButtons.forEach((weeklyButton) => {
      weeklyButton.addEventListener('click', (event) => {
        increaseWeekly(event, characterData);
      });
    });
  }

  increaseAllButton = document.querySelector('.increaseAllButton');
  increaseAllButton.addEventListener('click', async (event) => {
    await processButtons(dailyButtons, characterData);
  });

  editButton = document.querySelector('.editButton');
  editButton.addEventListener('click', (event) => {
    var url = `/${username}/${server}/${characterCode}/edit`;
    window.location.href = url;
  });
});

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

async function loadTopButtons(){
  const parentDiv = document.querySelector('.characterData');

  const blockDiv = createDOMElement('div','buttonWrapper');

  const increaseAllButon = createDOMElement('button', 'increaseAllButton','Increase all');
  const editButton = createDOMElement('button','editButton','Edit Character');
  
  blockDiv.appendChild(increaseAllButon);
  blockDiv.appendChild(editButton);
  parentDiv.appendChild(blockDiv);
}


async function loadCharacterNameDiv(characterData){
  const parentDiv = document.querySelector('.characterData');

  const characterInfo = createDOMElement('div','nameLinkLegion');
  
 

  const characterName = createDOMElement('span', 'characterName', characterData.name);
  
  const characterIconDiv = createDOMElement('div','characterIconDiv');

  if(characterData.bossing == true){
    const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
    const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');
    characterIconDiv.appendChild(bossIcon);
  }

  characterIconDiv.appendChild(characterName);

  characterInfo.appendChild(characterIconDiv);

  const linkLegionClassJob = createDOMElement('div','linkLegionClassJob');

  const linkSkill = await loadLinkSkillDiv(characterData);
  const legion = await loadLegionDiv(characterData);

  const JobType = createDOMElement('span','classType', characterData.class);
  adjustFontSizeToFit(JobType);

  const JobLevel = createDOMElement('span','jobLevel', characterData.job);

  const JobDiv = createDOMElement('div','jobDiv');

  JobDiv.appendChild(JobType);
  JobDiv.appendChild(JobLevel);

  linkLegionClassJob.appendChild(linkSkill);
  linkLegionClassJob.appendChild(legion);
  linkLegionClassJob.appendChild(JobDiv);
  
  characterInfo.appendChild(linkLegionClassJob);
  parentDiv.appendChild(characterInfo);
}

function adjustFontSizeToFit(JobType) {
  const copy = JobType.cloneNode(true); 
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.appendChild(copy);
  document.body.appendChild(container);
  let width = copy.offsetWidth;

  const maxWidth = 367;
  const originalFontSize = 56;
  let fontSize = originalFontSize;
  copy.style.fontSize = fontSize + 'px';
  console.log(width);
  while (width > maxWidth && fontSize > 0) {
    fontSize -= 1;
    copy.style.fontSize = fontSize + 'px';
    width = copy.offsetWidth;
  }
  document.body.removeChild(container);
  JobType.style.fontSize = fontSize + 'px';
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
  const linkspan = createDOMElement('span', 'linkLegionTitle', 'Link Skill');

  linkSkillData = await fetch('../../public/data/linkskill.json').then(response => response.json());
  filteredLink = linkSkillData.find(item => item.name === characterData.linkSkill);

  const linkImg = await createImageElement(filteredLink.image, filteredLink.name, `linkImg`);
 
  const linkSkillBlock = createDOMElement('div','linkSkillBlock');

  linkSkillBlock.appendChild(linkspan);
  linkSkillBlock.appendChild(linkImg);

  return linkSkillBlock;

}

async function loadLegionDiv(characterData) {
  legionData = await fetch('../../public/data/legionsystems.json').then(response => response.json());
  filterLegion = legionData.find(item => item.name === characterData.legion);

  const legionspan = createDOMElement('span','linkLegionTitle', 'Legion');

  let legionRank = getRank(characterData);
  const legionImgSrc = legionRank === 'no_rank'
  ? '../../public/assets/legion/no_rank.webp'
  : `../../public/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;

  const legionImg = await createImageElement(legionImgSrc, `${characterData.class} legion`, 'legionImg');

  const legionBlock = createDOMElement('div','legionBlock');

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

  const level = createDOMElement('span','level', 'Level');

  const levelNumber = createDOMElement('span', 'levelNumber',`${characterData.level}/${characterData.targetLevel}`);

  const levelDiv = createDOMElement('div','levelDiv');

  const levelBar = createProgressBar(characterData, characterData.level, characterData.targetLevel, 800, 32, 28);

  levelDiv.appendChild(level);
  levelDiv.appendChild(levelNumber);

  parentDiv.appendChild(levelDiv);
  parentDiv.appendChild(levelBar);
}

function createProgressBar(characterData, current, total, maxWidth, outerHeight, innerHeight, isArcane = false, isForce = false) {
  const outerDiv = createDOMElement('div','OuterEXPBar');
  outerDiv.style.width = `${maxWidth}px`;
  outerDiv.style.height = `${outerHeight}px`;

  const innerDiv = createDOMElement('div','InnerEXPBar');
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

  const Title = createDOMElement('span', forceType, isArcane ? 'Arcane Force' : 'Sacred Force');

  const forceDiv = createDOMElement('div',`${forceType}Div`);
  forceDiv.appendChild(Title);

  const forceGrid = createDOMElement('div',`${forceType}Grid`);

  for(force of forceData){
    const forceWrapper = createDOMElement('div',`${forceType}Wrapper`);

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
    
    const levelWrapper = createDOMElement('div','levelWrapper');

    const level = createDOMElement('span',`${forceType}Level`, `Level: ${forceLevel}`);

    levelWrapper.appendChild(level);

    if (characterData.level >= force.minLevel) {
      const expContent = createExpText(force, expTable, isArcane);
      levelWrapper.appendChild(expContent);
    }

    let expTotal = (isArcane && force.level === 20) || (!isArcane && force.level === 11)
    ? force.exp
    : expTable.level[force.level].EXP;

    const expBar = createProgressBar(characterData, force.exp, expTotal , 195, 8, 4, true, true);
    if (characterData.level < force.minLevel) {
      const innerbar = expBar.querySelector('.InnerEXPBar');
      innerbar.style.width = '0px';
  }


    const forceDataElement = createDOMElement('div',`${forceType}Data`);
    forceDataElement.setAttribute('area', areaName);
    forceDataElement.appendChild(levelWrapper);
    forceDataElement.appendChild(expBar);
    if((isArcane && force.level < 20) || (!isArcane && force.level < 11)){
      if (characterData.level >= force.minLevel) {
        const daysToMax = await returnDaysToMax(force, expTable, characterData, isArcane);
        const wrap = createDOMElement('div');
        wrap.className = 'buttons';
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
        const unlockText = createDOMElement('span','unlockText', `Unlock at Level ${force.minLevel}`);
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
  const image = createDOMElement('img', className);
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
    
      expNumber = createDOMElement('span', 'expNumber', `${Force.exp}/${nextLevelEXP}`);
    } else{
      expNumber = createDOMElement('span', 'expNumber', `MAX`);
    }
    
    const wrap = createDOMElement('div');

    wrap.appendChild(exp);
    wrap.appendChild(expNumber);

    return wrap;
}

async function returnDaysToMax(Force, expTable, characterData, isArcane = false){

  let totalExp = calculateTotalExp(Force.level, expTable);
  let dailyExp = getDailyValue(Force, characterData, isArcane);
  
  totalExp -= Force.exp;
  let daysToReachTotalExp = await updateDayToMax(Force, isArcane, characterData);

  
  const daysToMax = createDOMElement('span', 'daysToMax', isArcane ? `Days to Level 20: ${daysToReachTotalExp}` : `Days to Level 11: ${daysToReachTotalExp}`);

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
  let currentDate = DateTime.utc();
  let date = DateTime.fromISO(Force.content[0].date);
  let duration = currentDate.diff(date, 'days').days;
  const dailyButton = createDOMElement('button','dailyButton');
  if (duration >= 1 || isNaN(duration)){
    dailyButton.textContent = `Daily: + ${dailyValue}`;
  }
  else{
    dailyButton.textContent = "Daily done!";
    dailyButton.disabled = true;
  }
  if(Force.content[0].checked == false){
    dailyButton.disabled = true;
    dailyButton.textContent = "OFF!";
  }

  dailyButton.setAttribute('name', force.name);
  dailyButton.setAttribute('value', dailyValue);
  dailyButton.setAttribute('Arcane', isArcane);
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

  const weeklyButton = createDOMElement('button', 'weeklyButton');
  if(Force.content[1].tries > 0){
    weeklyButton.textContent =  `Weekly: ${Force.content[1].tries}/3`;
  }
  else{
    weeklyButton.disabled = true;
    weeklyButton.textContent = 'Done!';
  }
  if(Force.content[1].checked == false){
    weeklyButton.disabled = true;
    weeklyButton.textContent = 'OFF!';
  }
  weeklyButton.setAttribute('tries', Force.content[1].tries);
  weeklyButton.setAttribute('area' , Force.name);

  return weeklyButton;
}

async function increaseDaily(event, characterData){
  const clickedButton = event.target;
  const dailyValue = clickedButton.getAttribute('value');
  let isArcane = clickedButton.getAttribute('Arcane');
  isArcane = isArcane.toLowerCase() === 'true';
  const forceName = clickedButton.getAttribute('name');
  const neededExp = await getExp(characterData, isArcane, forceName);
  let currentDate = DateTime.utc();

  const postData ={
    forceType: isArcane,
    forceName: forceName,
    value: dailyValue,
    characterData: characterData, 
    necessaryExp: neededExp,
    date: currentDate
  }
  const URL = '/increaseDaily';
  await postRequest(postData, URL);
  await updateArea(forceName, isArcane);

  clickedButton.disabled = true;
  clickedButton.textContent = 'Daily done!';
}

async function increaseWeekly(event, characterData){
  const clickedButton = event.target;
  const forceName = clickedButton.getAttribute('area');
  const neededExp = await getExp(characterData, true, forceName);
  let currentDate = DateTime.utc();

  const postData ={
    forceName: forceName,
    value: 15,
    characterData: characterData, 
    necessaryExp: neededExp,
    date: currentDate
  }

  const URL = '/increaseWeekly';
  await postRequest(postData, URL);
  await updateArea(forceName, true);
  let tries = clickedButton.getAttribute('tries');
  tries = parseInt(tries);
  tries -= 1;
  if(tries < 0){
    tries = 0;
  }
  clickedButton.setAttribute('tries', tries);
  if(tries > 0){
    clickedButton.textContent = `Weekly:${tries}/3`;
  }
  else{
    clickedButton.disabled = true;
    clickedButton.textContent = 'Done!';
  }
};

async function getExp(characterData, isArcane, forceName){
  let object = null;
  let expValue = null;
  if(isArcane){
    for(const arcaneforce of characterData.ArcaneForce){
      if(arcaneforce.name === forceName){
        object = arcaneforce;
        break;
      }
    }
  } else{
    for(const sacredforce of characterData.SacredForce){
      if(sacredforce.name === forceName){
        object = sacredforce;
        break;
      }
    }
  }
  const jsonPath = isArcane ? '../../public/data/arcaneforceexp.json' : '../../public/data/sacredforceexp.json';
  const expTable = await fetch(jsonPath).then(response => response.json());
  if((isArcane && object.level < 20) || (!isArcane && object.level < 11)){
    expValue = expTable.level[object.level].EXP;
  }
  else{
    expValue = 'MAX';
  }
  
  return expValue;
}

async function postRequest(postData, URL){
  fetch(URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
})
}



async function updateArea(forceName, isArcane){
  characterData = await fetchCharacterData(username, server, characterCode);

  const forceArray = isArcane ? characterData.ArcaneForce : characterData.SacredForce;
  const areaProperty = isArcane ? 'ArcaneForceLevel' : 'SacredForceLevel';
  const areaData = forceArray.find((force) => force.name === forceName);

  targetDiv = document.querySelector(`div[area="${forceName}"]`);
  ForceLevel = targetDiv.querySelector(`.${areaProperty}`);
  ForceLevel.textContent = `Level: ${areaData.level}`;

  ForceEXPNumber = targetDiv.querySelector('.expNumber');

  const nextLevelEXPNumber = await getExp(characterData, isArcane, forceName);
  ForceEXPNumber.textContent = `${areaData.exp}/${nextLevelEXPNumber}`;

  if((isArcane && areaData.level === 20) || (!isArcane && areaData.level === 11)){
    ForceEXPNumber.textContent = `${nextLevelEXPNumber}`;
  }

  innerExpBar = targetDiv.querySelector('.InnerEXPBar');

  await updateExpBar(innerExpBar, areaData.exp, nextLevelEXPNumber);
  const remainDays = await updateDayToMax(areaData, isArcane, characterData);
  const daysToMax = targetDiv.querySelector('.daysToMax');
  daysToMax.textContent = isArcane ? `Days to Level 20: ${remainDays}` : `Days to Level 11: ${remainDays}`;

  if((isArcane && areaData.level === 20) || (!isArcane && areaData.level === 11)){
    const Buttons = targetDiv.querySelector('.buttons');
    daysToMax.remove();
    Buttons.remove();
  }
}

async function updateExpBar(innerExpBar, areaExp, nextLevelEXPNumber) {
  maxWidth = 191
  let barSize = (areaExp / nextLevelEXPNumber) * maxWidth;
  if(nextLevelEXPNumber === 'MAX') {
    barSize = maxWidth
  }
  if(barSize == maxWidth) {
    innerExpBar.style.backgroundColor = '#48AA39';
  }
  innerExpBar.style.width = barSize + 'px';
}
async function updateDayToMax(areaData, isArcane, characterData){
  const jsonPath = isArcane ? '../../public/data/arcaneforceexp.json' : '../../public/data/sacredforceexp.json';
  const expTable = await fetch(jsonPath).then(response => response.json());
  let totalExp = calculateTotalExp(areaData.level, expTable);
  let dailyExp = getDailyValue(areaData, characterData, isArcane);
  const weeklyExp = (areaData.content[1] && areaData.content[1].checked && isArcane) ? 45 : 0;
  totalExp -= areaData.exp;
  let daysToReachTotalExp = Math.ceil(totalExp / (dailyExp + (weeklyExp / 7)));
  return daysToReachTotalExp;
}

async function processButtons(dailyButtons, characterData) {
  let currentIndex = 0;

  async function processNextButton() {
    if (currentIndex < dailyButtons.length) {
      const dailyButton = dailyButtons[currentIndex];

      if (!dailyButton.disabled) {
        await increaseDaily({ target: dailyButton }, characterData);
      }

      currentIndex++;
      await processNextButton(); // Process the next button
    }
  }

  await processNextButton(); // Start processing buttons
}