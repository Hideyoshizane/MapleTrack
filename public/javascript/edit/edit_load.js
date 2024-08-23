const path = window.location.pathname;
const segments = path.split('/');
const username = segments[1];
const server = segments[2];
const characterCode = segments[3];

window.characterData;
window.dailyJson;
window.linkSkillData;
window.legionData;

document.addEventListener('DOMContentLoaded', async () => {
	characterData = await fetchCharacterData(username, server, characterCode);

	linkSkillData = await fetch('/../../../public/data/linkskill.json').then((response) => response.json());
	dailyJson = await fetch('../../../public/data/dailyExp.json').then((response) => response.json());
	legionData = await fetch('../../../public/data/legionsystems.json').then((response) => response.json());

	startLoader();
	await loadCharacterContent(characterData);

	document.dispatchEvent(new Event('PageLoaded'));

});

async function fetchCharacterData(username, server, characterCode) {
  const response = await fetch(`/class/${username}/${server}/${codeToClass(characterCode)}`).then(response => response.json());
  return response;
}

function startLoader(){
	const parentDiv = document.querySelector('.characterData');
	const loader = createDOMElement('span', 'loader');
	loader.style.marginTop = '35%';
	loader.style.marginRight = '50%'; 
	parentDiv.appendChild(loader);
}

async function loadCharacterContent(characterData) {
	const parentDiv = document.querySelector(".characterData");
	const loaderSpan = parentDiv.querySelector('.loader');
	if(loaderSpan)
	  parentDiv.removeChild(loaderSpan);
  
	await Promise.all([
		await loadCharacterNameDiv(characterData),
		await loadLevelAndLevelBar(characterData),
		await loadForce(characterData, true),
		await loadForce(characterData, false)
	]);

}

function createCheckboxWithLabel(className, labelText, checked) {
	const container = document.createElement('label');
	container.classList.add(className);

	const checkboxElement = document.createElement('input');
	checkboxElement.type = 'checkbox';
	checkboxElement.checked = checked;

	const textSpan = createDOMElement('span',null, labelText);

	container.appendChild(checkboxElement);
	container.appendChild(textSpan);

	return container;
}

function createSwitchButton(className, bossing) {
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

async function loadCharacterNameDiv(characterData) {
	const parentDiv = document.querySelector('.characterData');

	const characterInfo = createDOMElement('div','nameLinkLegion');

	const bossIconPath = characterData.bossing ? '/../../../public/assets/icons/menu/boss_slayer.svg' : '/../../../public/assets/icons/menu/boss_slayer_off.svg';

	const bossIcon = await loadEditableSVGFile(bossIconPath, 'bossIcon');

	const characterName = createDOMElement('input', 'characterName', characterData.name);

	const characterIconDiv = createDOMElement('div', 'characterIconDiv');

	characterIconDiv.appendChild(bossIcon);
	characterIconDiv.appendChild(characterName);

	characterInfo.appendChild(characterIconDiv);

	const linkLegionClassJob = createDOMElement('div', 'linkLegionClassJob');

	const linkSkill = await loadLinkSkillDiv(characterData);
	const legion = await loadLegionDiv(characterData);

	const JobType = createDOMElement('span', 'classType', characterData.class);
	JobType.style.fontSize = await adjustFontSizeToFit(JobType, 19.115, 3) + 'rem';

	const JobLevel = createDOMElement('span', 'jobLevel', getJob(characterData));

	const JobDiv = createDOMElement('div', 'jobDiv');

	const bossText = createDOMElement('span', 'bossText', 'Bossing Character');
	const switchButton = createSwitchButton('bossSwitch', characterData.bossing);

	const bossArea = createDOMElement('div', 'bossArea');

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

async function loadLinkSkillDiv(characterData) {
	const linkspan = createDOMElement('span', 'linkLegionTitle', 'Link Skill');

	const filteredLink = linkSkillData.find((item) => item.name === characterData.linkSkill);

	const linkImg = await createImageElement(filteredLink.image,filteredLink.name,`linkImg`);

	const linkSkillBlock = createDOMElement('div', 'linkSkillBlock');

	linkSkillBlock.appendChild(linkspan);
	linkSkillBlock.appendChild(linkImg);

	return linkSkillBlock;
}

async function loadLegionDiv(characterData) {

	const legionspan = createDOMElement('span', 'linkLegionTitle', 'Legion');

	const legionRank = getRank(characterData);
	const legionImgSrc =
		legionRank === 'no_rank'
			? '/../../../public/assets/legion/no_rank.webp'
			: `/../../../public/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;

	const legionImg = await createImageElement(legionImgSrc,`${characterData.class} legion`,'legionImg');

	const legionBlock = createDOMElement('div', 'legionBlock');

	legionBlock.appendChild(legionspan);
	legionBlock.appendChild(legionImg);

	return legionBlock;
}

async function loadLevelAndLevelBar(characterData) {
	const parentDiv = document.querySelector('.characterData');

	const level = createDOMElement('span', 'level', 'Level');

	const levelNumber = createDOMElement('input','levelNumber',`${characterData.level}`,'number');
	const levelTarget = createDOMElement('input','levelTarget',`${characterData.targetLevel}`,'number');
	const Bar = createDOMElement('span', 'Bar', '/');

	const levelDiv = createDOMElement('div', 'levelDiv');

	const levelBarData = {
		level: characterData.level,
		targetLevel: characterData.targetLevel,
		jobType: characterData.jobType,
	  }

	const levelBar = await createLeveLBar(levelBarData, 41.458, 'characterLevelBar');
	levelBar.setAttribute('jobType', characterData.jobType);
	
	levelDiv.appendChild(level);
	levelDiv.appendChild(levelNumber);
	levelDiv.appendChild(Bar);
	levelDiv.appendChild(levelTarget);

	parentDiv.appendChild(levelDiv);
	parentDiv.appendChild(levelBar);
}

async function loadForce(characterData, isArcane) {
	const parentDiv = document.querySelector('.characterData');

	const forceType = isArcane ? 'ArcaneForce' : 'SacredForce';
	const forceData = characterData[forceType];

	const Title = createDOMElement('span', forceType, isArcane ? 'Arcane Force' : 'Sacred Force');

	const forceDiv = createDOMElement('div', `${forceType}Div`);
	forceDiv.appendChild(Title);

	const forceGrid = createDOMElement('div', `${forceType}Grid`);

	for (force of forceData) {
		const forceWrapper = createDOMElement('div', `${forceType}Wrapper`);

		const areaName = force.name;
		const areaCode = areaName.replace(/\s+/g, '_').toLowerCase();
		let forceLevel = force.level;
		const minLevel = dailyJson.find(json => json.name === force.name).minLevel;

		const icon = await createImageElement(`../../../public/assets/${forceType.toLowerCase()}/${areaCode}.webp`,	areaName,`${forceType}Image`);

		if (characterData.level < minLevel) {
			icon.classList.add('off');
			forceLevel = 0;
			forceWrapper.classList.add('off');
		}

		forceWrapper.appendChild(icon);

		const levelWrapper = createDOMElement('div', 'levelWrapper');

		const level = createDOMElement('span', `${forceType}Level`, `Level:`);
		const levelInput = createDOMElement('input', 'levelInput', `${force.level}`);

		levelWrapper.appendChild(level);

		let checkboxContent = createDOMElement('div', 'checkboxContent');

		if (characterData.level >= minLevel) {
			levelWrapper.appendChild(levelInput);
			const expContent = createDOMElement('span', 'expContent', 'EXP:');
			const expInput = createDOMElement('input', 'expInput', `${force.exp}`);
			levelWrapper.appendChild(expContent);
			levelWrapper.appendChild(expInput);

			for (forceContent of force.content) {
				const value = forceContent.contentType == 'Daily Quest' ? dailyJson.find(json => json.name === force.name).value : dailyJson.find(json => json.name === "Weekly").value;
				const expGain = forceContent.contentType === 'Reverse City' || forceContent.contentType === 'Yum Yum Island' ? '10' : value;
				const checkbox = createCheckboxWithLabel('forceCheckbox',`${forceContent.contentType}: +${expGain}`,forceContent.checked);
				checkboxContent.appendChild(checkbox);
			}
		} else {
			level.textContent = 'Level: 0';
		}

		const forceDataElement = createDOMElement('div', `${forceType}Data`);
		forceDataElement.setAttribute('area', areaName);
		forceDataElement.appendChild(levelWrapper);
		if (characterData.level >= minLevel) {
			forceDataElement.appendChild(checkboxContent);
		}
		if (characterData.level < minLevel) {
			const unlockText = createDOMElement('span','unlockText',`Unlock at Level ${minLevel}`);
			forceDataElement.appendChild(unlockText);
		}

		forceWrapper.appendChild(forceDataElement);
		forceGrid.appendChild(forceWrapper);
	}
	forceDiv.appendChild(forceGrid);
	parentDiv.appendChild(forceDiv);
}


