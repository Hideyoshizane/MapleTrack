
const path = window.location.pathname;
const segments = path.split('/');

const username = segments[1];
const server = segments[2];
const characterCode = segments[3];

window.characterData;
window.ArcaneTable;
window.SacredTable;
window.dailyJson;
window.linkSkillData;
window.legionData;

document.addEventListener('DOMContentLoaded', async () => {

  ArcaneTable = await fetch('../../public/data/arcaneforceexp.json').then(response => response.json());
  SacredTable = await fetch('../../public/data/sacredforceexp.json').then(response => response.json());
  dailyJson   = await fetch('../../../public/data/dailyExp.json').then((response) => response.json());
  linkSkillData = await fetch('/../../../public/data/linkskill.json').then((response) => response.json());
  legionData = await fetch('../../../public/data/legionsystems.json').then((response) => response.json());

  characterData = await fetchCharacterData(username, server, characterCode);

  await loadCharacterContent();
  await loadButtonsEvents();

  await loadFlashMessage();
  
	const linkImg = document.querySelector('.linkImg');
	linkImg.addEventListener('mouseover', () => {
		handleLinkImgMouseOver(linkImg);
	});
	linkImg.addEventListener('mouseout', () => {
		handleMouseOut(); 
	});

	const legionImg = document.querySelector('.legionImg');
	legionImg.addEventListener('mouseover', () => {
		handleLegionImgMouseOver(legionImg);
	});
	legionImg.addEventListener('mouseout', () => {
		handleMouseOut(); 
	});


});

const fetchCharacterData = async (username, server, characterCode) => {
  try {
    return await (await fetch(`/class/${username}/${server}/${codeToClass(characterCode)}`)).json();
  } catch (error) {
    console.error('Error fetching character data:', error);
  }
};

async function loadCharacterContent() {
  await loadCharacterImage();
  await loadTopButtons();
  await loadCharacterNameDiv();
  await loadLevelAndLevelBar();
  await loadForce(true);
  await loadForce(false);
}

async function loadCharacterImage() {
  const parentDiv = document.querySelector('.classImage');

  const image = await createImageElement(`../../public/assets/profile/${characterCode}.webp`, `${characterData.class} profile picture`, `portraitImage`);

  parentDiv.appendChild(image);
};


async function loadTopButtons(){
  const parentDiv = document.querySelector('.characterData');

  const blockDiv = createDOMElement('div','buttonWrapper');

  const increaseAllButon = createDOMElement('button', 'increaseAllButton','Increase all');
  const editButton = createDOMElement('button','editButton','Edit Character');
  
  blockDiv.appendChild(increaseAllButon);
  blockDiv.appendChild(editButton);
  parentDiv.appendChild(blockDiv);
}


async function loadCharacterNameDiv(){
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

  const linkSkill = await loadLinkSkillDiv();
  const legion = await loadLegionDiv();

  const JobType = createDOMElement('span','classType', characterData.class);
  JobType.style.fontSize = await adjustFontSizeToFit(JobType, 367, 48) + 'px';

  const JobLevel = createDOMElement('span','jobLevel', getJob(characterData));

  const JobDiv = createDOMElement('div','jobDiv');

  JobDiv.appendChild(JobType);
  JobDiv.appendChild(JobLevel);

  linkLegionClassJob.appendChild(linkSkill);
  linkLegionClassJob.appendChild(legion);
  linkLegionClassJob.appendChild(JobDiv);
  
  characterInfo.appendChild(linkLegionClassJob);
  parentDiv.appendChild(characterInfo);
}


async function loadLinkSkillDiv(){
  const linkspan = createDOMElement('span', 'linkLegionTitle', 'Link Skill');

  const linkSkillData = await fetch('../../public/data/linkskill.json').then(response => response.json());
  const filteredLink = linkSkillData.find(item => item.name === characterData.linkSkill);

  const linkImg = await createImageElement(filteredLink.image, filteredLink.name, `linkImg`);
 
  const linkSkillBlock = createDOMElement('div','linkSkillBlock');

  linkSkillBlock.appendChild(linkspan);
  linkSkillBlock.appendChild(linkImg);

  return linkSkillBlock;

}

async function loadLegionDiv() {

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

async function loadLevelAndLevelBar(){
  const parentDiv = document.querySelector('.characterData');

  const level = createDOMElement('span','level', 'Level');

  const levelNumber = createDOMElement('span', 'levelNumber',`${characterData.level}/${characterData.targetLevel}`);

  const levelDiv = createDOMElement('div','levelDiv');

  const levelBarData = {
    level: characterData.level,
    targetLevel: characterData.targetLevel,
    jobType: characterData.jobType,
  }

  const levelBar = await createLeveLBar(levelBarData, 796, 'characterLevelBar');

  levelDiv.appendChild(level);
  levelDiv.appendChild(levelNumber);

  parentDiv.appendChild(levelDiv);
  parentDiv.appendChild(levelBar);
}

async function loadForce(isArcane){
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

    const minLevel = dailyJson.find(json => json.name === force.name).minLevel;

    const icon = await createImageElement(`../../public/assets/${forceType.toLowerCase()}/${areaCode}.webp`, areaName, `${forceType}Image`);
      if (characterData.level < minLevel) {
          icon.classList.add('off');
          forceLevel = 0;
      }

    forceWrapper.appendChild(icon);

    const expTable = isArcane ? ArcaneTable : SacredTable;
    
    const levelWrapper = createDOMElement('div','levelWrapper');

    const level = createDOMElement('span',`${forceType}Level`, `Level: ${forceLevel}`);

    levelWrapper.appendChild(level);

    if (characterData.level >= minLevel) {
      const expContent = createExpText(force, expTable, isArcane);
      levelWrapper.appendChild(expContent);
    }
    let expTotal = (isArcane && force.level === 20) || (!isArcane && force.level === 11)
      ? force.exp
      : expTable.level[force.level].EXP;

    const levelBarData = {
      level: force.exp,
      targetLevel: expTotal,
      jobType: characterData.jobType,
    }

    const expBar = await createLeveLBar(levelBarData, 191, 'forceLevelBar');
    
    if (characterData.level < minLevel) {
      const innerbar = expBar.querySelector('.progressBar');
      innerbar.style.width = '0px';
  }


    const forceDataElement = createDOMElement('div',`${forceType}Data`);
    forceDataElement.setAttribute('area', areaName);
    forceDataElement.appendChild(levelWrapper);
    forceDataElement.appendChild(expBar);

    if((isArcane && force.level < 20) || (!isArcane && force.level < 11)){
      if (characterData.level >= minLevel) {
        const daysToMax = await returnDaysToMax(force, isArcane);
        const wrap = createDOMElement('div');
        wrap.className = 'buttons';
        wrap.style.display = 'flex';
        wrap.style.justifyContent = 'space-between';

        const dailyButton = createDailyButton(force, isArcane);
        wrap.appendChild(dailyButton);

        if(isArcane){
          const weeklyButton = createWeeklyButton(force, isArcane);
          wrap.appendChild(weeklyButton);
        }
      
        forceDataElement.appendChild(daysToMax);
        forceDataElement.appendChild(wrap);
        
      } else {
        const unlockText = createDOMElement('span','unlockText', `Unlock at Level ${minLevel}`);
        forceDataElement.appendChild(unlockText);
      }
    }

    forceWrapper.appendChild(forceDataElement);
    forceGrid.appendChild(forceWrapper);
  }
  forceDiv.appendChild(forceGrid);
  parentDiv.appendChild(forceDiv);
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

async function returnDaysToMax(Force, isArcane = false){

  const daysToReachTotalExp = await updateDayToMax(Force, isArcane);
  
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

function createDailyButton(Force, isArcane = false){
  const dailyValue = getDailyValue(Force, isArcane);

  const currentDate = DateTime.utc();
  const lastDate = Force.content[0].date ? DateTime.fromISO(Force.content[0].date,  { zone: 'utc' }) : null;

  const nextMidnight = lastDate ? lastDate.plus({ days: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }) : null;

  const duration =  Force.content[0].date ? timeConditionChecker(nextMidnight, currentDate) : null;

  const dailyButton = createDOMElement('button','dailyButton');
  if (duration || duration == null){
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

function getDailyValue(Force, isArcane = false){
  const dailyQuest = Number(dailyJson.find(json => json.name === Force.name).value);
  let dailyValue = dailyQuest;

  if(isArcane){
    if(Force.content[2] && Force.content[2].checked == true){
      secondAreaMinLevel = Number(dailyJson.find(json => json.name == Force.content[2].contentType).minLevel);
      if(characterData.level >= secondAreaMinLevel){
        const secondArea = Number(dailyJson.find(json => json.name == Force.content[2].contentType).value);
        dailyValue += secondArea;
      }
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

async function loadButtonsEvents(){

  const dailyButtons = document.querySelectorAll('.dailyButton');
  dailyButtons?.forEach((dailyButton) => {
    dailyButton.addEventListener('click', async (event) => {
      if (!dailyButton.disabled) {
        await increaseDaily(event);
      }
    });
  });
  
  const weeklyButtons = document.querySelectorAll('.weeklyButton');
    weeklyButtons?.forEach((weeklyButton) => {
      weeklyButton.addEventListener('click', (event) => {
        increaseWeekly(event);
    });
  });

  increaseAllButton = document.querySelector('.increaseAllButton');
  increaseAllButton.addEventListener('click', async (event) => {
    await processButtons(dailyButtons);
  });

  editButton = document.querySelector('.editButton');
  editButton.addEventListener('click', (event) => {
    var url = `/${username}/${server}/${characterCode}/edit`;
    window.location.href = url;
  });
}

async function increaseDaily(event){
  const clickedButton = event.target;
  const dailyValue = clickedButton.getAttribute('value');

  let isArcane = clickedButton.getAttribute('Arcane');
  isArcane = isArcane.toLowerCase() === 'true';
  const forceName = clickedButton.getAttribute('name');
  const neededExp = await getExp(isArcane, forceName);
  const currentDate = DateTime.utc();

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

async function increaseWeekly(event){
  const clickedButton = event.target;
  const forceName = clickedButton.getAttribute('area');
  const neededExp = await getExp(true, forceName);
  let currentDate = DateTime.utc().toJSDate();

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

async function getExp(isArcane, forceName) {
  const object = isArcane 
    ? characterData.ArcaneForce.find(arcaneforce => arcaneforce.name === forceName)
    : characterData.SacredForce.find(sacredforce => sacredforce.name === forceName);
    
  const expTable = isArcane ? ArcaneTable : SacredTable;

  if (object.level < (isArcane ? 20 : 11)) {
    return expTable.level[object.level].EXP;
  } else {
    return 'MAX';
  }
}


async function postRequest(postData, URL){
  await fetch(URL, {
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

  const nextLevelEXPNumber = await getExp(isArcane, forceName);
  ForceEXPNumber.textContent = `${areaData.exp}/${nextLevelEXPNumber}`;

  if((isArcane && areaData.level === 20) || (!isArcane && areaData.level === 11)){
    ForceEXPNumber.textContent = `${nextLevelEXPNumber}`;
  }

  innerExpBar = targetDiv.querySelector('.progressBar');
  
  await updateExpBar(innerExpBar, areaData.exp, nextLevelEXPNumber, 191, characterData.jobType);

  const remainDays = await updateDayToMax(areaData, isArcane);

  const daysToMax = targetDiv.querySelector('.daysToMax').textContent = isArcane ? `Days to Level 20: ${remainDays}` : `Days to Level 11: ${remainDays}`;

  if((isArcane && areaData.level === 20) || (!isArcane && areaData.level === 11)){
    const Buttons = targetDiv.querySelector('.buttons');
    daysToMax.remove();
    Buttons.remove();
  }
}

async function updateDayToMax(areaData, isArcane){
  const expTable = isArcane ? ArcaneTable : SacredTable;

  const weeklyValue = Number(dailyJson.find(json => json.name === 'Weekly').value);
  let totalExp = calculateTotalExp(areaData.level, expTable);
  let dailyExp = getDailyValue(areaData, isArcane);
  const weeklyExp = (areaData.content[2] && areaData.content[2].checked && isArcane) ? (weeklyValue*3) : 0;
  totalExp -= areaData.exp;
  return Math.ceil(totalExp / (dailyExp + (weeklyExp / 7)));
}


async function processButtons(dailyButtons) {
  let currentIndex = 0;

  async function processNextButton() {
    if (currentIndex < dailyButtons.length) {
      const dailyButton = dailyButtons[currentIndex];

      if (!dailyButton.disabled) {
        await increaseDaily({ target: dailyButton });
      }

      currentIndex++;
      await processNextButton(); // Process the next button
    }
  }

  await processNextButton(); // Start processing buttons
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


function handleMouseOut() {
  const tooltip = document.querySelector('.infoTooltip') || document.querySelector('.linkSkillToolTip') || document.querySelector('.LegionImgTooltip');
  if (tooltip) {
      tooltip.remove();
  }
}

function handleLinkImgMouseOver(linkImg){

const filteredLink = linkSkillData.find((item) => item.name === characterData.linkSkill).levels;
const levelNumber = Number(document.querySelector('.levelNumber').textContent.split('/')[0].trim());

let text;
if (levelNumber < 120) {
  text = filteredLink[0].description;
} else if (levelNumber >= 120 && filteredLink.length >= 2) {
  text = filteredLink[1].description;

  if (filteredLink.length === 3) {
    text = filteredLink[2].description;
  }
}

const tempTooltip = createDOMElement('div', 'linkSkillToolTip', text);

document.body.appendChild(tempTooltip);
const tempTooltipCenter = getCenterPosition(tempTooltip);
document.body.removeChild(tempTooltip);

const linkImgCenter = getCenterPosition(linkImg);

const tooltip = createDOMElement('div', 'linkSkillToolTip', text);

const offsetX = linkImgCenter.x - tempTooltipCenter.x;

  tooltip.style.top = `${linkImgCenter.y + 59}px`;
  tooltip.style.left = `${offsetX}px`;
  document.body.appendChild(tooltip);

}

function handleLegionImgMouseOver(legionImg){	
const levelNumber = Number(document.querySelector('.levelNumber').textContent.split('/')[0].trim());  

const characterDataPlaceholder = {
  class: characterData.class,
  level: levelNumber,
}

const legionInfo = legionData.find((item) => item.name === characterData.legion).ranking;
const characterRank = getRank(characterDataPlaceholder);
let text = '';

for (legion of legionInfo) {
  if (characterRank === legion.rank.toLowerCase()) {
    text += `<strong>Rank ${legion.rank}: ${legion.description}</strong> <br>`;
  } else {
    text += `Rank ${legion.rank}: ${legion.description}<br>`;
  }
}

const tempTooltip = createDOMElement('div', 'LegionImgTooltip');
  tempTooltip.innerHTML = `<div>${text}</div>`;

document.body.appendChild(tempTooltip);
const tempTooltipCenter = getCenterPosition(tempTooltip);
document.body.removeChild(tempTooltip);

const legionImgCenter = getCenterPosition(legionImg);

const tooltip = createDOMElement('div', 'LegionImgTooltip');
tooltip.innerHTML = `<div>${text}</div>`;

  const offsetX = legionImgCenter.x - tempTooltipCenter.x;
  
  tooltip.style.top = `${legionImgCenter.y + 59}px`;
  tooltip.style.left = `${offsetX}px`;
  document.body.appendChild(tooltip);
}


function getCenterPosition(element) {
  const rect = element.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return { x: centerX, y: centerY };
}