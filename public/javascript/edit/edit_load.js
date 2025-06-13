const path = window.location.pathname;
const segments = path.split('/');
const username = DOMPurify.sanitize(segments[1]);
const server = DOMPurify.sanitize(segments[2]);
const characterCode = DOMPurify.sanitize(segments[3]);

window.characterData;
window.dailyJson;
window.linkSkillData;
window.legionData;
window.maxLevel = 300;

document.addEventListener('DOMContentLoaded', async () => {
	characterData = await fetchCharacterData(username, server, characterCode);

	linkSkillData = await fetch('/data/linkskill.json').then((response) => response.json());
	dailyJson = await fetch('/data/dailyExp.json').then((response) => response.json());
	legionData = await fetch('/data/legionsystems.json').then((response) => response.json());

	startLoader();
	await loadCharacterContent(characterData);

	document.dispatchEvent(new Event('PageLoaded'));
});

async function fetchCharacterData(username, server, characterCode) {
	const sanitizedUsername = DOMPurify.sanitize(username);
	const sanitizedServer = DOMPurify.sanitize(server);
	const sanitizedCharacterCode = DOMPurify.sanitize(characterCode);

	const response = await fetch(
		`/class/${sanitizedUsername}/${sanitizedServer}/${codeToClass(sanitizedCharacterCode)}`
	).then((response) => response.json());
	return response;
}

function startLoader() {
	const parentDiv = document.querySelector('.characterData');
	const loader = createDOMElement('span', 'loader');
	loader.style.marginTop = '35%';
	loader.style.marginRight = '50%';
	parentDiv.appendChild(loader);
}

async function loadCharacterContent(characterData) {
	const parentDiv = document.querySelector('.characterData');
	const characterForce = createDOMElement('div', 'characterForce');
	const loaderSpan = parentDiv.querySelector('.loader');
	if (loaderSpan) parentDiv.removeChild(loaderSpan);

	await Promise.all([
		await loadCharacterNameDiv(characterData),
		await loadLevelAndLevelBar(characterData),
		parentDiv.appendChild(characterForce),
		await loadForce(characterData, 'ArcaneForce'),
		await loadForce(characterData, 'SacredForce'),
		await loadForce(characterData, 'GrandSacredForce'),
	]);
}

function createCheckboxWithLabel(className, labelText, checked) {
	const container = document.createElement('label');
	container.classList.add(className);

	const checkboxElement = document.createElement('input');
	checkboxElement.type = 'checkbox';
	checkboxElement.checked = checked;

	const textSpan = createDOMElement('span', null, DOMPurify.sanitize(labelText));

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

	const characterInfo = createDOMElement('div', 'nameLinkLegion');

	const bossIconPath = characterData.bossing
		? '/assets/icons/menu/boss_slayer.svg'
		: '/assets/icons/menu/boss_slayer_off.svg';

	const bossIcon = await loadEditableSVGFile(bossIconPath, 'bossIcon');

	const characterName = createDOMElement('input', 'characterName', DOMPurify.sanitize(characterData.name));

	const characterIconDiv = createDOMElement('div', 'characterIconDiv');

	characterIconDiv.appendChild(characterName);

	characterInfo.appendChild(characterIconDiv);

	const linkLegionClassJob = createDOMElement('div', 'linkLegionClassJob');

	linkLegionClassJob.appendChild(bossIcon);

	const bossIconDiv = createDOMElement('div', 'bossIconDiv');
	const bossArea = createDOMElement('div', 'bossArea');

	const bossText = createDOMElement('span', 'bossText', 'Bossing Character');
	const switchButton = createSwitchButton('bossSwitch', characterData.bossing);

	bossArea.appendChild(bossText);
	bossArea.appendChild(switchButton);

	bossIconDiv.appendChild(bossIcon);
	bossIconDiv.appendChild(bossArea);

	const linkSkill = await loadLinkSkillDiv(characterData);
	const legion = await loadLegionDiv(characterData);

	const JobType = createDOMElement('span', 'classType', DOMPurify.sanitize(characterData.class));
	JobType.style.fontSize = (await adjustFontSizeToFit(JobType, 19.115, 3)) + 'rem';

	const JobLevel = createDOMElement('span', 'jobLevel', getJob(characterData));

	const JobDiv = createDOMElement('div', 'jobDiv');

	JobDiv.appendChild(JobType);
	JobDiv.appendChild(JobLevel);

	linkLegionClassJob.appendChild(bossIconDiv);
	linkLegionClassJob.appendChild(linkSkill);
	linkLegionClassJob.appendChild(legion);
	linkLegionClassJob.appendChild(JobDiv);

	characterInfo.appendChild(linkLegionClassJob);
	parentDiv.appendChild(characterInfo);
}

async function loadLinkSkillDiv(characterData) {
	const linkspan = createDOMElement('span', 'linkLegionTitle', 'Link Skill');

	const filteredLink = linkSkillData.find((item) => item.name === characterData.linkSkill);

	const linkImg = await createImageElement(filteredLink.image, filteredLink.name, `linkImg`);

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
			? '/assets/legion/no_rank.webp'
			: `/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;

	const legionImg = await createImageElement(
		legionImgSrc,
		`${DOMPurify.sanitize(characterData.class)} legion`,
		'legionImg'
	);

	const legionBlock = createDOMElement('div', 'legionBlock');

	legionBlock.appendChild(legionspan);
	legionBlock.appendChild(legionImg);

	return legionBlock;
}

async function loadLevelAndLevelBar(characterData) {
	const parentDiv = document.querySelector('.characterData');

	const level = createDOMElement('span', 'level', 'Level');

	const levelNumber = createDOMElement('input', 'levelNumber', `${characterData.level}`, 'number');
	const levelTarget = createDOMElement('input', 'levelTarget', `${characterData.targetLevel}`, 'number');
	const Bar = createDOMElement('span', 'Bar', '/');

	const levelDiv = createDOMElement('div', 'levelDiv');

	const levelBarData = {
		level: characterData.level,
		targetLevel: characterData.targetLevel,
		jobType: characterData.jobType,
	};

	const levelBar = await createLeveLBar(levelBarData, 46.667, 'characterLevelBar');
	levelBar.setAttribute('jobType', characterData.jobType);

	levelDiv.appendChild(level);
	levelDiv.appendChild(levelNumber);
	levelDiv.appendChild(Bar);
	levelDiv.appendChild(levelTarget);

	parentDiv.appendChild(levelDiv);
	parentDiv.appendChild(levelBar);
}

async function loadForce(characterData, forceType) {
	const parentDiv = document.querySelector('.characterForce');

	const forceData = characterData[forceType];

	const forceTypeTitle = {
		ArcaneForce: 'Arcane Force',
		SacredForce: 'Sacred Force',
		GrandSacredForce: 'Grand Sacred Force',
	};

	const Title = createDOMElement('span', `${forceType}`, forceTypeTitle[forceType]);

	const forceDiv = createDOMElement('div', `${forceType}Div`);
	forceDiv.appendChild(Title);

	const forceGrid = createDOMElement('div', `${forceType}Grid`);
	for (force of forceData) {
		const forceWrapper = createDOMElement('div', `${forceType}Wrapper`);

		const areaName = DOMPurify.sanitize(force.name);
		const areaCode = areaName.replace(/\s+/g, '_').toLowerCase();
		let forceLevel = force.level;
		const minLevel = dailyJson.find((json) => json.name === force.name).minLevel;

		const icon = await createImageElement(
			`/assets/${forceType.toLowerCase()}/${areaCode}.webp`,
			areaName,
			`${forceType}Image`
		);

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
				const value =
					forceContent.contentType == 'Daily Quest'
						? dailyJson.find((json) => json.name === force.name).value
						: dailyJson.find((json) => json.name === 'Weekly').value;
				const expGain =
					forceContent.contentType === 'Reverse City' || forceContent.contentType === 'Yum Yum Island' ? '10' : value;
				const checkbox = createCheckboxWithLabel(
					'forceCheckbox',
					`${forceContent.contentType}: +${expGain}`,
					forceContent.checked
				);
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
			const unlockText = createDOMElement('span', 'unlockText', `Unlock at Level ${minLevel}`);
			forceDataElement.appendChild(unlockText);
		}

		forceWrapper.appendChild(forceDataElement);
		forceGrid.appendChild(forceWrapper);
	}
	forceDiv.appendChild(forceGrid);
	parentDiv.appendChild(forceDiv);
}
