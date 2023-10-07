const path = window.location.pathname;
const segments = path.split('/');
const username = segments[1];
const server = segments[2];
const characterCode = segments[3];

window.CharacterData;

document.addEventListener('DOMContentLoaded', async () => {
	characterData = await fetchCharacterData(username, server, characterCode);

	await loadCharacterContent(characterData);

	const bossSwitch = document.querySelector(
		'.bossSwitch input[type="checkbox"]'
	);
	bossSwitch.addEventListener('change', (event) => {
		changebossIcon(bossSwitch.checked);
	});

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

	levelNumber.addEventListener('blur', async function (event) {
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
	saveButton.addEventListener('click', async (event) => {
		await saveDataAndPost();
		var url = `/${username}/${server}/${characterCode}`;
		window.location.href = url;
	});
});

async function fetchCharacterData(username, server, characterCode) {
	try {
		const response = await fetch(
			`/code/${username}/${server}/${characterCode}`
		);
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

	const image = await createImageElement(
		`../../public/assets/profile/${characterData.code}.webp`,
		`${characterData.class} profile picture`,
		`portraitImage`
	);
	parentDiv.appendChild(image);
}

function createDOMElement(tag, className = '', content = '', type = '') {
    const element = document.createElement(tag);
  
    if (className) {
      element.classList.add(className);
    }
  
    if (content !== '') {
      element.textContent = content;
    }

	if(tag == 'input'){
		element.placeholder = content;
	}
	
	if(type !== ''){
		element.type = type;
	}
  
    return element;
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

async function loadTopButtons() {
	const parentDiv = document.querySelector('.characterData');

	const blockDiv = createDOMElement('div', 'buttonWrapper');

	const discardButton = createDOMElement('button', 'discardButton', 'Discard Changes');
	const saveButton = createDOMElement('button', 'saveButton', 'Save Changes');

	blockDiv.appendChild(discardButton);
	blockDiv.appendChild(saveButton);
	parentDiv.appendChild(blockDiv);
}

async function loadCharacterNameDiv(characterData) {
	const parentDiv = document.querySelector('.characterData');

	const characterInfo = createDOMElement('div','nameLinkLegion');

	let bossIconPath;
	if (characterData.bossing == true) {
		bossIconPath = '../../../public/assets/icons/menu/boss_slayer.svg';
	} else {
		bossIconPath = '../../../public/assets/icons/menu/boss_slayer_off.svg';
	}

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
	adjustFontSizeToFit(JobType);

	const JobLevel = createDOMElement('span', 'jobLevel', characterData.job);

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

		const svgElement = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'svg'
		);

		svgElement.innerHTML = svgData;

		if (className) {
			svgElement.classList.add(className);
		}

		return svgElement;
	} catch (error) {
		console.error('Error loading SVG file:', error);
		return null;
	}
}

async function loadLinkSkillDiv(characterData) {
	const linkspan = createDOMElement('span', 'linkLegionTitle', 'Link Skill');

	linkSkillData = await fetch('../../../public/data/linkskill.json').then(
		(response) => response.json()
	);
	filteredLink = linkSkillData.find(
		(item) => item.name === characterData.linkSkill
	);

	const linkImg = await createImageElement(
		filteredLink.image,
		filteredLink.name,
		`linkImg`
	);

	const linkSkillBlock = createDOMElement('div', 'linkSkillBlock');

	linkSkillBlock.appendChild(linkspan);
	linkSkillBlock.appendChild(linkImg);

	return linkSkillBlock;
}

async function loadLegionDiv(characterData) {
	legionData = await fetch('../../public/data/legionsystems.json').then(
		(response) => response.json()
	);
	filterLegion = legionData.find((item) => item.name === characterData.legion);

	const legionspan = createDOMElement('span', 'linkLegionTitle', 'Legion');

	let legionRank = getRank(characterData);
	const legionImgSrc =
		legionRank === 'no_rank'
			? '../../../public/assets/legion/no_rank.webp'
			: `../../../public/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;

	const legionImg = await createImageElement(
		legionImgSrc,
		`${characterData.class} legion`,
		'legionImg'
	);

	const legionBlock = createDOMElement('div', 'legionBlock');

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

async function loadLevelAndLevelBar(characterData) {
	const parentDiv = document.querySelector('.characterData');

	const level = createDOMElement('span', 'level', 'Level');

	const levelNumber = createDOMElement(
		'input',
		'levelNumber',
		`${characterData.level}`,
		'number'
	);
	const levelTarget = createDOMElement(
		'input',
		'levelTarget',
		`${characterData.targetLevel}`,
		'number'
	);
	const Bar = createDOMElement('span', 'Bar', '/');

	const levelDiv = createDOMElement('div', 'levelDiv');

	const levelBar = createProgressBar(
		characterData,
		characterData.level,
		characterData.targetLevel,
		800,
		32,
		28
	);

	levelDiv.appendChild(level);
	levelDiv.appendChild(levelNumber);
	levelDiv.appendChild(Bar);
	levelDiv.appendChild(levelTarget);

	parentDiv.appendChild(levelDiv);
	parentDiv.appendChild(levelBar);
}

function createProgressBar(
	characterData,
	current,
	total,
	maxWidth,
	outerHeight,
	innerHeight,
	isArcane = false,
	isForce = false
) {
	const outerDiv = createDOMElement('div', 'OuterEXPBar');
	outerDiv.style.width = `${maxWidth}px`;
	outerDiv.style.height = `${outerHeight}px`;
	outerDiv.setAttribute('jobType', characterData.jobType);

	const innerDiv = createDOMElement('div', 'InnerEXPBar');
	innerDiv.style.height = `${innerHeight}px`;
	let barSize = (current / total) * maxWidth;
	if (isArcane && total.level === 20 && isForce) {
		barSize = maxWidth;
	} else if (!isArcane && total.level === 11 && isForce) {
		barSize = maxWidth;
	}

	if (barSize >= maxWidth) barSize = maxWidth - 4;
	if (current === 0 && total === 0) {
		barSize = maxWidth - 4;
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

async function loadForce(characterData, isArcane) {
	const parentDiv = document.querySelector('.characterData');

	const forceType = isArcane ? 'ArcaneForce' : 'SacredForce';
	const forceData = characterData[forceType];

	const Title = createDOMElement(
		'span',
		forceType,
		isArcane ? 'Arcane Force' : 'Sacred Force'
	);

	const forceDiv = createDOMElement('div', `${forceType}Div`);
	forceDiv.appendChild(Title);

	const forceGrid = createDOMElement('div', `${forceType}Grid`);

	for (force of forceData) {
		const forceWrapper = createDOMElement('div', `${forceType}Wrapper`);

		const areaName = force.name;
		const areaCode = areaName.replace(/\s+/g, '_').toLowerCase();
		let forceLevel = force.level;

		const icon = await createImageElement(
			`../../../public/assets/${forceType.toLowerCase()}/${areaCode}.webp`,
			areaName,
			`${forceType}Image`
		);
		if (characterData.level < force.minLevel) {
			icon.classList.add('off');
			forceLevel = 0;
			forceWrapper.classList.add('off');
		}

		forceWrapper.appendChild(icon);

		const jsonPath = isArcane
			? '../../../public/data/arcaneforceexp.json'
			: '../../../public/data/sacredforceexp.json';
		const expTable = await fetch(jsonPath).then((response) => response.json());

		const levelWrapper = createDOMElement('div', 'levelWrapper');

		const level = createDOMElement('span', `${forceType}Level`, `Level:`);
		const levelInput = createDOMElement('input', 'levelInput', `${force.level}`);

		levelWrapper.appendChild(level);
		let checkboxContent = createDOMElement('div', 'checkboxContent');
		if (characterData.level >= force.minLevel) {
			levelWrapper.appendChild(levelInput);
			const expContent = createDOMElement('span', 'expContent', 'EXP:');
			const expInput = createDOMElement('input', 'expInput', `${force.exp}`);
			levelWrapper.appendChild(expContent);
			levelWrapper.appendChild(expInput);

			for (forceContent of force.content) {
				let expGain = forceContent.expGain;
				if (
					forceContent.contentType == 'Reverse City' ||
					forceContent.contentType == 'Yum Yum Island'
				) {
					expGain = '2x';
				}
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
		if (characterData.level >= force.minLevel) {
			forceDataElement.appendChild(checkboxContent);
		}
		if ((isArcane && force.level < 20) || (!isArcane && force.level < 11)) {
			if (characterData.level < force.minLevel) {
				const unlockText = createDOMElement(
					'span',
					'unlockText',
					`Unlock at Level ${force.minLevel}`
				);
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
  
    await image.decode();
    return image;
  }


function createExpText(Force, expTable, isArcane = false) {
	const exp = createDOMElement('span', 'exp', 'EXP:');
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

async function changebossIcon(checked) {
	bossIcon = document.querySelector('.bossIcon');
	if (checked) {
		const bossIconpath = '../../../public/assets/icons/menu/boss_slayer.svg';
		const bossIconON = await loadEditableSVGFile(bossIconpath, 'bossIcon');
		bossIcon.replaceWith(bossIconON);
	} else {
		const bossIconpath =
			'../../../public/assets/icons/menu/boss_slayer_off.svg';
		const bossIconOFF = await loadEditableSVGFile(bossIconpath, 'bossIcon');
		bossIcon.replaceWith(bossIconOFF);
	}
}

async function updateExpBar(levelNumberValue, levelTargetValue) {
	const outerDiv = document.querySelector('.OuterEXPBar');
	const innerExpBar = document.querySelector('.InnerEXPBar');
	const jobType = outerDiv.getAttribute('jobType');
	let levelValue = Number(levelNumberValue);
	let targetValue = Number(levelTargetValue);
	maxWidth = 796;

	let barSize = (levelValue / targetValue) * maxWidth;
	if (levelValue >= targetValue) {
		innerExpBar.style.backgroundColor = '#48AA39';
	}
	if (barSize >= maxWidth) barSize = maxWidth;
	else {
		setStyle(innerExpBar, jobType, levelValue, targetValue);
	}
	innerExpBar.style.width = barSize + 'px';
}

async function updateClass(levelNumberValue) {
	const level = Number(levelNumberValue);
	targetSpan = document.querySelector('.jobLevel');
	if (level < 30) {
		targetSpan.textContent = '1st Class';
	}
	if (level >= 30 && level < 60) {
		targetSpan.textContent = '2nd Class';
	}
	if (level >= 60 && level < 100) {
		targetSpan.textContent = '3rd Class';
	}
	if (level >= 100 && level < 200) {
		targetSpan.textContent = '4th Class';
	}
	if (level >= 200) {
		targetSpan.textContent = 'V Class';
	}
}

async function updateLegion(levelNumberValue) {
	const level = Number(levelNumberValue);
	const data = { level, characterCode };
	const rank = getRank(data);
	targetImage = document.querySelector('.legionImg');
	targetImage.src =
		rank === 'no_rank'
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
		const areaData = characterData[`${type}Force`].filter(
			(force) => force.name === areaName
		);

		if (level < areaData[0].minLevel && !force.classList.contains('off')) {
			image.classList.add('off');
			force.classList.add('off');
			const levelWrapper = force.querySelector('.levelWrapper');
			const wrap = createDOMElement('div', 'levelWrapper');
			const level = createDOMElement('span', `${type}ForceLevel`, `Level: 0`);
			wrap.appendChild(level);
			levelWrapper.replaceWith(wrap);

			const checkboxContent = force.querySelector('.checkboxContent');
			const unlockText = createDOMElement(
				'span',
				'unlockText',
				`Unlock at Level ${areaData[0].minLevel}`
			);
			checkboxContent.replaceWith(unlockText);
		}

		if (level >= areaData[0].minLevel && force.classList.contains('off')) {
			image.classList.remove('off');
			force.classList.remove('off');
			const levelWrapper = force.querySelector('.levelWrapper');
			const wrap = createDOMElement('div', 'levelWrapper');
			const level = createDOMElement('span', `${type}ForceLevel`, `Level:`);
			const levelInput = createDOMElement('input', 'levelInput', `${areaData[0].level}`);
			const expContent = createDOMElement('span', 'expContent', 'EXP:');
			const expInput = createDOMElement('input', 'expInput', `${areaData[0].exp}`);
			wrap.appendChild(level);
			wrap.appendChild(levelInput);
			wrap.appendChild(expContent);
			wrap.appendChild(expInput);
			levelWrapper.replaceWith(wrap);

			const unlockText = areaDiv.querySelector('.unlockText');
			let checkboxContent = createDOMElement('div', 'checkboxContent');
			for (const forceContent of areaData[0].content) {
				const checkbox = createCheckboxWithLabel(
					'forceCheckbox',
					`${forceContent.contentType}`,
					forceContent.checked
				);
				checkboxContent.appendChild(checkbox);
			}
			unlockText.replaceWith(checkboxContent);
		}
	}
}

async function saveDataAndPost() {
	let characterName = document.querySelector('.characterName').value;
	if (characterName.length == 0) {
		characterName = 'Character Name';
	}

	let bossSwitch = document.querySelector(
		'.bossSwitch input[type="checkbox"]'
	).checked;

	let jobLevel = document.querySelector('.jobLevel').innerText;

	let level = Number(document.querySelector('.levelNumber').value);
	if (level == 0 || level < 0) {
		level = Number(document.querySelector('.levelNumber').placeholder);
	}
	if (level > 300) {
		level = 300;
	}

	let targetLevel = Number(document.querySelector('.levelTarget').value);
	if (targetLevel == 0 || targetLevel < 0) {
		targetLevel = Number(document.querySelector('.levelTarget').placeholder);
	}
	if (targetLevel > 300) {
		targetLevel = 300;
	}
	const arcaneForceArray = returnForceArray('Arcane');
	const sacredForceArray = returnForceArray('Sacred');

	const characterToUpdate = {
		_id: characterData._id,
		name: characterName,
		level: level,
		targetLevel: targetLevel,
		job: jobLevel,
		bossing: bossSwitch,
		ArcaneForce: arcaneForceArray,
		SacredForce: sacredForceArray,
	};
	fetch('/updateCharacter', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(characterToUpdate),
	}).catch((error) => {
		console.error('Error:', error);
	});
}

function returnForceArray(forceType) {
	const forceWrapperClass =
		forceType === 'Arcane' ? '.ArcaneForceWrapper' : '.SacredForceWrapper';
	const ForceArray = [];

	const forceWrappers = document.querySelectorAll(forceWrapperClass);

	for (const forceWrapper of forceWrappers) {
		if (!forceWrapper.classList.contains('off')) {
			const name = forceWrapper
				.querySelector(`.${forceType}ForceData`)
				.getAttribute('area');
			let level = forceWrapper.querySelector(
				`.${forceType}ForceWrapper .levelInput`
			).value;
			if (level <= 0) {
				level = forceWrapper.querySelector(
					`.${forceType}ForceWrapper .levelInput`
				).placeholder;
			}
			let exp = forceWrapper.querySelector(
				`.${forceType}ForceWrapper .expInput`
			).value;
			if (exp <= 0) {
				exp = forceWrapper.querySelector(
					`.${forceType}ForceWrapper .expInput`
				).placeholder;
			}

			const checksArray = [];
			const checkboxes = forceWrapper.querySelectorAll(
				`.${forceType}ForceWrapper .forceCheckbox`
			);

			for (const checkbox of checkboxes) {
				const checkboxName = checkbox.querySelector('span').textContent;
				const checkboxChecked = checkbox.querySelector(
					`.${forceType}ForceWrapper input[type="checkbox"]`
				).checked;

				const checkObject = {
					name: checkboxName,
					checked: checkboxChecked,
				};

				checksArray.push(checkObject);
			}

			const forceObject = {
				name: name,
				level: level,
				exp: exp,
				content: checksArray,
			};

			ForceArray.push(forceObject);
		}
	}

	return ForceArray;
}
