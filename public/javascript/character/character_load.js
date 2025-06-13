const path = window.location.pathname;
const segments = path.split('/');

const username = DOMPurify.sanitize(segments[1]);
const server = DOMPurify.sanitize(segments[2]);
const characterCode = DOMPurify.sanitize(segments[3]);

window.characterData;
window.ArcaneTable;
window.SacredTable;
window.GrandSacredTable;
window.dailyJson;
window.linkSkillData;
window.legionData;

document.addEventListener('DOMContentLoaded', async () => {
	ArcaneTable = await fetch('/data/arcaneforceexp.json').then((response) => response.json());
	SacredTable = await fetch('/data/sacredforceexp.json').then((response) => response.json());
	GrandSacredTable = await fetch('/data/grandsacredforceexp.json').then((response) => response.json());
	dailyJson = await fetch('/data/dailyExp.json').then((response) => response.json());
	linkSkillData = await fetch('/data/linkskill.json').then((response) => response.json());
	legionData = await fetch('/data/legionsystems.json').then((response) => response.json());

	characterData = await fetchCharacterData(username, server, characterCode);

	startLoader();
	await loadCharacterContent();

	document.dispatchEvent(new Event('PageLoaded'));
});

function startLoader() {
	const parentDiv = document.querySelector('.characterData');
	const loader = createDOMElement('span', 'loader');
	loader.style.marginTop = '35%';
	loader.style.marginRight = '50%';
	parentDiv.appendChild(loader);
}

const fetchCharacterData = async (username, server, characterCode) => {
	try {
		return await (await fetch(`/class/${username}/${server}/${codeToClass(characterCode)}`)).json();
	} catch (error) {
		console.error('Error fetching character data:', error);
	}
};

async function loadCharacterContent() {
	const parentDiv = document.querySelector('.characterData');
	const characterForce = createDOMElement('div', 'characterForce');
	const loaderSpan = parentDiv.querySelector('.loader');
	if (loaderSpan) parentDiv.removeChild(loaderSpan);

	await Promise.all([
		await loadCharacterNameDiv(),
		await loadLevelAndLevelBar(),
		await loadEventBonus(),
		parentDiv.appendChild(characterForce),
		await loadForce('ArcaneForce'),
		await loadForce('SacredForce'),
		await loadForce('GrandSacredForce'),
	]);
}

async function loadCharacterNameDiv() {
	const parentDiv = document.querySelector('.characterData');

	const characterInfo = createDOMElement('div', 'nameLinkLegion');

	const characterName = createDOMElement('span', 'characterName', DOMPurify.sanitize(characterData.name));

	const characterIconDiv = createDOMElement('div', 'characterIconDiv');

	characterIconDiv.appendChild(characterName);

	characterInfo.appendChild(characterIconDiv);

	const linkLegionClassJob = createDOMElement('div', 'linkLegionClassJob');

	if (characterData.bossing == true) {
		const bossIconpath = '/assets/icons/menu/boss_slayer.svg';
		const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');
		linkLegionClassJob.appendChild(bossIcon);
	}
	const linkSkill = await loadLinkSkillDiv();
	const legion = await loadLegionDiv();

	const JobType = createDOMElement('span', 'classType', DOMPurify.sanitize(characterData.class));
	JobType.style.fontSize = (await adjustFontSizeToFit(JobType, 19.115, 3)) + 'rem';

	const JobLevel = createDOMElement('span', 'jobLevel', DOMPurify.sanitize(getJob(characterData)));

	const JobDiv = createDOMElement('div', 'jobDiv');

	JobDiv.appendChild(JobType);
	JobDiv.appendChild(JobLevel);

	linkLegionClassJob.appendChild(linkSkill);
	linkLegionClassJob.appendChild(legion);
	linkLegionClassJob.appendChild(JobDiv);

	characterInfo.appendChild(linkLegionClassJob);
	parentDiv.appendChild(characterInfo);
}

async function loadLinkSkillDiv() {
	const linkspan = createDOMElement('span', 'linkLegionTitle', 'Link Skill');

	const linkSkillData = await fetch('/data/linkskill.json').then((response) => response.json());
	const filteredLink = linkSkillData.find((item) => item.name === characterData.linkSkill);

	const linkImg = await createImageElement(filteredLink.image, DOMPurify.sanitize(filteredLink.name), `linkImg`);

	const linkSkillBlock = createDOMElement('div', 'linkSkillBlock');

	linkSkillBlock.appendChild(linkspan);
	linkSkillBlock.appendChild(linkImg);

	return linkSkillBlock;
}

async function loadLegionDiv() {
	const legionspan = createDOMElement('span', 'linkLegionTitle', 'Legion');

	let legionRank = getRank(characterData);
	const legionImgSrc =
		legionRank === 'no_rank'
			? '/assets/legion/no_rank.webp'
			: `/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;

	const legionImg = await createImageElement(
		legionImgSrc,
		DOMPurify.sanitize(`${characterData.class} legion`),
		'legionImg'
	);

	const legionBlock = createDOMElement('div', 'legionBlock');

	legionBlock.appendChild(legionspan);
	legionBlock.appendChild(legionImg);

	return legionBlock;
}

async function loadLevelAndLevelBar() {
	const parentDiv = document.querySelector('.characterData');

	const level = createDOMElement('span', 'level', 'Level');

	const levelNumber = createDOMElement(
		'span',
		'levelNumber',
		DOMPurify.sanitize(`${characterData.level}/${characterData.targetLevel}`)
	);

	const levelDiv = createDOMElement('div', 'levelDiv');

	const levelBarData = {
		level: characterData.level,
		targetLevel: characterData.targetLevel,
		jobType: characterData.jobType,
	};

	const levelBar = await createLeveLBar(levelBarData, 46.667, 'characterLevelBar');

	levelDiv.appendChild(level);
	levelDiv.appendChild(levelNumber);

	parentDiv.appendChild(levelDiv);
	parentDiv.appendChild(levelBar);
}

async function loadNumberButtons(parentDiv) {
	const dropdownToggle = createDOMElement('button', 'dropdownToggle');
	dropdownToggle.id = 'dropdownToggle';

	const numberSelector = createDOMElement('div', 'numberSelector');

	try {
		const fragment = document.createDocumentFragment();

		for (let i = 0; i <= 10; i++) {
			const createdButton = createDOMElement('button', 'numberButton');
			createdButton.textContent = `Bonus ${i}`;
			fragment.appendChild(createdButton);
		}
		numberSelector.appendChild(fragment);
	} catch (error) {
		console.error('Error creating number buttons:', error);
	}
	dropdownToggle.appendChild(numberSelector);
	parentDiv.appendChild(dropdownToggle);
}

async function loadEventBonus() {
	let eventBonusValue = getCookie('eventBonus');
	if (eventBonusValue === null) {
		setCookie('eventBonus', 0, 90);
		eventBonusValue = 0;
	}
	const eventButton = document.querySelector('.eventButton');
	updateEventBonusButton(eventBonusValue);

	let isOpen = false;

	eventButton.addEventListener('click', function () {
		isOpen = !isOpen;

		eventButton.classList.toggle('open', isOpen);
		eventButton.classList.toggle('closed', !isOpen);
	});
}
function updateEventBonusButton(eventBonusValue) {
	const firstButton = document.querySelector('.firstButton');
	firstButton.textContent = `Event Bonus ${eventBonusValue}`;
}

async function loadForce(forceType) {
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
			`../../public/assets/${forceType.toLowerCase()}/${areaCode}.webp`,
			areaName,
			`${forceType}Image`
		);
		if (characterData.level < minLevel) {
			icon.classList.add('off');
			forceLevel = 0;
		}

		forceWrapper.appendChild(icon);

		const forceTypeMap = {
			ArcaneForce: window.ArcaneTable,
			SacredForce: window.SacredTable,
			GrandSacredForce: window.GrandSacredTable,
		};
		const expTable = forceTypeMap[forceType];

		const levelWrapper = createDOMElement('div', 'levelWrapper');

		const level = createDOMElement('span', `${forceType}Level`, `Level: ${forceLevel}`);

		levelWrapper.appendChild(level);

		if (characterData.level >= minLevel) {
			const expContent = createExpText(force, expTable, forceType === 'ArcaneForce');
			levelWrapper.appendChild(expContent);
		}

		let expTotal =
			(forceType === 'ArcaneForce' && force.level === 20) ||
			((forceType === 'SacredForce' || forceType === 'GrandSacredForce') && force.level === 11)
				? force.exp
				: expTable.level[force.level].EXP;

		const levelBarData = {
			level: force.exp,
			targetLevel: expTotal,
			jobType: characterData.jobType,
		};

		const expBar = await createLeveLBar(levelBarData, 12.083, 'forceLevelBar');

		if (characterData.level < minLevel) {
			const innerbar = expBar.querySelector('.progressBar');
			innerbar.style.width = '0px';
		}

		const forceDataElement = createDOMElement('div', `${forceType}Data`);
		forceDataElement.setAttribute('area', areaName);
		forceDataElement.appendChild(levelWrapper);
		forceDataElement.appendChild(expBar);

		if (
			(forceType === 'ArcaneForce' && force.level < 20) ||
			((forceType === 'SacredForce' || forceType === 'GrandSacredForce') && force.level < 11)
		) {
			if (characterData.level >= minLevel) {
				const daysToMax = await returnDaysToMax(force, forceType === 'ArcaneForce');
				const wrap = createDOMElement('div');
				wrap.className = 'buttons';
				wrap.style.display = 'flex';
				wrap.style.justifyContent = 'space-between';

				const dailyButton = createDailyButton(force, forceType);
				wrap.appendChild(dailyButton);

				if (forceType === 'ArcaneForce') {
					const weeklyButton = createWeeklyButton(force, forceType === 'ArcaneForce');
					wrap.appendChild(weeklyButton);
				}

				forceDataElement.appendChild(daysToMax);
				forceDataElement.appendChild(wrap);
			} else {
				const unlockText = createDOMElement('span', 'unlockText', `Unlock at Level ${minLevel}`);
				forceDataElement.appendChild(unlockText);
			}
		}

		forceWrapper.appendChild(forceDataElement);
		forceGrid.appendChild(forceWrapper);
	}
	forceDiv.appendChild(forceGrid);
	parentDiv.appendChild(forceDiv);
}

function createExpText(Force, expTable, isArcane = false) {
	const exp = document.createElement('span');
	exp.className = 'exp';
	exp.innerText = 'EXP:';
	let expNumber;

	if ((isArcane && Force.level < 20) || (!isArcane && Force.level < 11)) {
		const nextLevelEXP = expTable.level[Force.level].EXP;

		expNumber = createDOMElement('span', 'expNumber', `${Force.exp}/${nextLevelEXP}`);
	} else {
		expNumber = createDOMElement('span', 'expNumber', `MAX`);
	}

	const wrap = createDOMElement('div');

	wrap.appendChild(exp);
	wrap.appendChild(expNumber);

	return wrap;
}

async function returnDaysToMax(Force, isArcane = false) {
	const daysToReachTotalExp = await updateDayToMax(Force, isArcane);

	const daysToMax = createDOMElement(
		'span',
		'daysToMax',
		isArcane ? `Days to Level 20: ${daysToReachTotalExp}` : `Days to Level 11: ${daysToReachTotalExp}`
	);

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

function createDailyButton(Force, forceType) {
	let isArcane = forceType === 'ArcaneForce' ? true : false;
	const dailyValue = getDailyValue(Force, isArcane);
	const EventBonusValue = getCookie('eventBonus');

	const totalDailyValue = +dailyValue + +EventBonusValue;
	const currentDate = DateTime.utc();
	const lastDate = Force.content[0].date ? DateTime.fromISO(Force.content[0].date, { zone: 'utc' }) : null;

	const nextMidnight = lastDate
		? lastDate.plus({ days: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
		: null;

	const duration = Force.content[0].date ? timeConditionChecker(nextMidnight, currentDate) : null;

	const dailyButton = createDOMElement('button', 'dailyButton');
	if (duration || duration == null) {
		dailyButton.textContent = `Daily: +${totalDailyValue}`;
	} else {
		dailyButton.textContent = 'Daily clear!';
		dailyButton.disabled = true;
	}
	if (Force.content[0].checked == false) {
		dailyButton.disabled = true;
		dailyButton.textContent = 'Disabled';
	}

	dailyButton.setAttribute('name', force.name);
	dailyButton.setAttribute('value', totalDailyValue);
	dailyButton.setAttribute('bonusEvent', EventBonusValue);
	dailyButton.setAttribute('Arcane', forceType);
	return dailyButton;
}

function getDailyValue(Force, isArcane = false) {
	const dailyQuest = Number(dailyJson.find((json) => json.name === Force.name).value);
	let dailyValue = dailyQuest;

	if (isArcane) {
		if (Force.content[2] && Force.content[2].checked == true) {
			secondAreaMinLevel = Number(dailyJson.find((json) => json.name == Force.content[2].contentType).minLevel);
			if (characterData.level >= secondAreaMinLevel) {
				const secondArea = Number(dailyJson.find((json) => json.name == Force.content[2].contentType).value);
				dailyValue += secondArea;
			}
		}
	}

	return dailyValue;
}

function createWeeklyButton(Force) {
	const weeklyButton = createDOMElement('button', 'weeklyButton');

	if (Force.content[1].tries > 0) {
		weeklyButton.textContent = `Weekly: ${Force.content[1].tries}/3`;
	} else {
		weeklyButton.disabled = true;
		weeklyButton.textContent = 'Clear!';
	}
	if (Force.content[1].checked == false) {
		weeklyButton.disabled = true;
		weeklyButton.textContent = 'Disabled';
	}
	weeklyButton.setAttribute('tries', Force.content[1].tries);
	weeklyButton.setAttribute('area', Force.name);

	return weeklyButton;
}
