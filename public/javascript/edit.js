const path = window.location.pathname;
const segments = path.split('/');
const username = segments[1];
const server = segments[2];
const characterCode = segments[3];

window.characterData;
window.dailyJson;

document.addEventListener('DOMContentLoaded', async () => {
	characterData = await fetchCharacterData(username, server, characterCode);
	dailyJson = await fetch('../../../public/data/dailyExp.json').then((response) => response.json());

	await loadCharacterContent(characterData);

	const bossSwitch = document.querySelector('.bossSwitch input[type="checkbox"]');
	bossSwitch.addEventListener('change', () => {
		changebossIcon(bossSwitch.checked);
	});

	discardButton = document.querySelector('.discardButton');
	discardButton.addEventListener('click', () => {
		var url = `/${username}/${server}/${characterCode}`;
		window.location.href = url;
	});

	saveButton = document.querySelector('.saveButton');
	saveButton.addEventListener('click', async (event) => {
		await saveDataAndPost();
	});

	const characterName = document.querySelector('.characterName');
	const levelNumber = document.querySelector('.levelNumber');
	const levelTarget = document.querySelector('.levelTarget');

	characterName.addEventListener('input', async() => {
		const valid = isValidCharacterName(characterName.value);
		characterName.style.color = valid ? "#000000" : "#C33232";
		saveButton.disabled = !	valid;
	})

	levelNumber.addEventListener('input', async () => {
		const levelNumberValue = levelNumber.value;
		const levelTargetValue = levelTarget.value;

		const jobType = document.querySelector('.characterLevelBar').getAttribute('jobType');
		const progressBar = document.querySelector('.progressBar');
		await updateExpBar(progressBar, levelNumberValue, levelTargetValue, 796, jobType);
		
		await updateClass(levelNumberValue);
		await updateLegion(levelNumberValue);
	});

	levelNumber.addEventListener('blur', async function () {
		const level = levelNumber.value;
		await updateForce('Arcane', level);
		await updateForce('Sacred', level);
	});

	levelTarget.addEventListener('input', async () => {
		const levelNumberValue = levelNumber.value;
		const levelTargetValue = levelTarget.value;
		const jobType = document.querySelector('.characterLevelBar').getAttribute('jobType');
		const progressBar = document.querySelector('.progressBar');
		
		await updateExpBar(progressBar, levelNumberValue, levelTargetValue, 796, jobType);

		await updateClass(levelNumberValue);
	});


});

async function fetchCharacterData(username, server, characterCode) {
  const response = await fetch(`/class/${username}/${server}/${codeToClass(characterCode)}`).then(response => response.json());
  return response;
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

	const image = await createImageElement(`/../../public/assets/profile/${characterCode}.webp`,`${characterData.class} profile picture`,`portraitImage`);
	parentDiv.appendChild(image);
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
	if(characterData.name == 'Character Name')
		saveButton.disabled = true;

	blockDiv.appendChild(discardButton);
	blockDiv.appendChild(saveButton);
	parentDiv.appendChild(blockDiv);
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
	JobType.style.fontSize = await adjustFontSizeToFit(JobType, 367, 48) + 'px';

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

	const linkSkillData = await fetch('/../../../public/data/linkskill.json').then((response) => response.json());

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

	const levelBar = await createLeveLBar(levelBarData, 796, 'characterLevelBar');
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
				const expGain = forceContent.contentType === 'Reverse City' || forceContent.contentType === 'Yum Yum Island' ? '2x' : value;
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


async function changebossIcon(checked) {
	const bossIcon = document.querySelector('.bossIcon');
	const bossIconPath = checked
	  ? '../../../public/assets/icons/menu/boss_slayer.svg'
	  : '../../../public/assets/icons/menu/boss_slayer_off.svg';
  
	const bossIconElement = await loadEditableSVGFile(bossIconPath, 'bossIcon');
	bossIcon.replaceWith(bossIconElement);
  }
  

async function updateClass(levelNumberValue) {
	const level = {level:Number(levelNumberValue)}
	targetSpan = document.querySelector('.jobLevel').textContent = getJob(level);
}

async function updateLegion(levelNumberValue) {
	const level = Number(levelNumberValue);
	const data = { level, class: codeToClass(characterCode) };
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

		const levelWrapper = force.querySelector('.levelWrapper');
		const wrap = createDOMElement('div', 'levelWrapper');
		const minLevel = dailyJson.find(json => json.name === areaData[0].name).minLevel;
		if (level < minLevel && !force.classList.contains('off')) {
			image.classList.add('off');
			force.classList.add('off');
			const level = createDOMElement('span', `${type}ForceLevel`, `Level: 0`);
			wrap.appendChild(level);
			levelWrapper.replaceWith(wrap);

			const checkboxContent = force.querySelector('.checkboxContent');
			const unlockText = createDOMElement(
				'span',
				'unlockText',
				`Unlock at Level ${minLevel}`
			);
			checkboxContent.replaceWith(unlockText);
		}

		if (level >= minLevel && force.classList.contains('off')) {
			image.classList.remove('off');
			force.classList.remove('off');
			
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
	const characterName =
		document.querySelector('.characterName').value ||
		document.querySelector('.characterName').placeholder;

	const bossSwitch = document.querySelector(
		'.bossSwitch input[type="checkbox"]'
	).checked;

	let level = Number(document.querySelector('.levelNumber').value);
	level =
		level <= 0
			? Number(document.querySelector('.levelNumber').placeholder)
			: Math.min(level, 300);

	let targetLevel = Number(document.querySelector('.levelTarget').value);
	targetLevel =
		targetLevel <= 0
			? Number(document.querySelector('.levelTarget').placeholder)
			: Math.min(targetLevel, 300);

	const arcaneForceArray = returnForceArray('Arcane');
	const sacredForceArray = returnForceArray('Sacred');

	const characterToUpdate = {
		_id: characterData._id,
		name: characterName,
		level: level,
		targetLevel: targetLevel,
		bossing: bossSwitch,
		ArcaneForce: arcaneForceArray,
		SacredForce: sacredForceArray,
		server: server,
		username: username,
		characterCode: characterCode,
	};
	try {
		const response = await fetch('/updateCharacter', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			},
			body: JSON.stringify(characterToUpdate),
		  });
		  
		const success = response.ok;
		const type = success ? 'success' : 'failed';
		const message = success ? 'Character updated sucessfully' : 'There was an error updating';
		setCookieFlash('type', type,  50);
		setCookieFlash('message', message, 50);
		
		var url = `/${username}/${server}/${characterCode}`;
		window.location.href = url;

	} catch (error) {
		console.error('Error:', error);
	}
}

function returnForceArray(forceType) {
	const forceWrapperClass = forceType === 'Arcane' ? '.ArcaneForceWrapper' : '.SacredForceWrapper';
	const forceWrappers = document.querySelectorAll(forceWrapperClass);

	const ForceArray = [];

	for (const forceWrapper of forceWrappers) {
		if (!forceWrapper.classList.contains('off')) {
			const name = forceWrapper.querySelector(`.${forceType}ForceData`).getAttribute('area');

			const levelInput = forceWrapper.querySelector(`.${forceType}ForceWrapper .levelInput`);
			const level = levelInput.value <= 0 ? levelInput.placeholder : levelInput.value;
			
			const expInput = forceWrapper.querySelector(`.${forceType}ForceWrapper .expInput`);
			const exp = expInput.value <= 0 ? expInput.placeholder : expInput.value;

			const checksArray = [];
			const checkboxes = forceWrapper.querySelectorAll(`.${forceType}ForceWrapper .forceCheckbox`);

			for (const checkbox of checkboxes) {
				const checkboxName = checkbox.querySelector('span').textContent;
				const checkboxChecked = checkbox.querySelector(`.${forceType}ForceWrapper input[type="checkbox"]`).checked;

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



function isValidCharacterName(characterName) {
    const minLength = 5;
    const maxLength = 20;
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    
    return characterName.length >= minLength && characterName.length <= maxLength && alphanumericRegex.test(characterName);

}