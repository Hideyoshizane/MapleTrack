document.addEventListener('PageLoaded', async () => {
	try {
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
	} catch (error) {
		console.error('Error loading:', error);
	}
});

async function loadButtonsEvents() {
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

	const eventNumber = document.querySelectorAll('.eventNumber');
	eventNumber?.forEach((eventNumber) => {
		eventNumber.addEventListener('click', async (event) => {
			await updateEventBonus(event);
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

async function loadFlashMessage() {
	const type = getCookie('type');
	if (type) {
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
	const tooltip =
		document.querySelector('.infoTooltip') ||
		document.querySelector('.linkSkillToolTip') ||
		document.querySelector('.LegionImgTooltip');
	if (tooltip) {
		tooltip.remove();
	}
}

function handleLinkImgMouseOver(linkImg) {
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
	mainContent = document.querySelector('.mainContent');

	const tempTooltip = createDOMElement('div', 'linkSkillToolTip', text);

	tempTooltip.style.position = 'absolute';
	tempTooltip.style.visibility = 'hidden';

	mainContent.appendChild(tempTooltip);

	const tempTooltipCenter = getCenterPosition(tempTooltip);
	mainContent.removeChild(tempTooltip);

	const linkImgCenter = getCenterPosition(linkImg);

	const tooltip = createDOMElement('div', 'linkSkillToolTip', text);

	const offsetX = linkImgCenter.x - tempTooltipCenter.x;

	tooltip.style.top = `${linkImgCenter.y + 59}px`;
	tooltip.style.left = `${offsetX + 164}px`;
	document.body.appendChild(tooltip);
}

function handleLegionImgMouseOver(legionImg) {
	const levelNumber = Number(document.querySelector('.levelNumber').textContent.split('/')[0].trim());

	const characterDataPlaceholder = {
		class: characterData.class,
		level: levelNumber,
	};

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

	mainContent = document.querySelector('.mainContent');

	const tempTooltip = createDOMElement('div', 'LegionImgTooltip');
	tempTooltip.innerHTML = `<div>${text}</div>`;

	tempTooltip.style.position = 'absolute';
	tempTooltip.style.visibility = 'hidden';

	mainContent.appendChild(tempTooltip);
	const tempTooltipCenter = getCenterPosition(tempTooltip);
	mainContent.removeChild(tempTooltip);

	const legionImgCenter = getCenterPosition(legionImg);

	const tooltip = createDOMElement('div', 'LegionImgTooltip');
	tooltip.innerHTML = `<div>${text}</div>`;

	const offsetX = legionImgCenter.x - tempTooltipCenter.x;

	tooltip.style.top = `${legionImgCenter.y + 59}px`;
	tooltip.style.left = `${offsetX + 164}px`;
	document.body.appendChild(tooltip);
}

function getCenterPosition(element) {
	const rect = element.getBoundingClientRect();

	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;

	return { x: centerX, y: centerY };
}

async function increaseDaily(event) {
	const clickedButton = event.target;
	const dailyValue = clickedButton.getAttribute('value');
	const forceType = clickedButton.getAttribute('Arcane');
	const forceName = clickedButton.getAttribute('name');

	const neededExp = await getExp(forceType, forceName);
	const currentDate = DateTime.utc();

	const postData = {
		forceType: forceType,
		forceName: forceName,
		value: dailyValue,
		characterData: characterData,
		necessaryExp: neededExp,
		date: currentDate,
	};
	const URL = '/increaseDaily';
	await postRequest(postData, URL);
	await updateArea(forceName, forceType);

	clickedButton.disabled = true;
	clickedButton.textContent = 'Daily done!';
}

async function increaseWeekly(event) {
	const clickedButton = event.target;
	const forceName = clickedButton.getAttribute('area');
	const neededExp = await getExp('ArcaneForce', forceName);
	let currentDate = DateTime.utc().toJSDate();

	const postData = {
		forceName: forceName,
		value: 15,
		characterData: characterData,
		necessaryExp: neededExp,
		date: currentDate,
	};

	const URL = '/increaseWeekly';
	await postRequest(postData, URL);
	await updateArea(forceName, 'ArcaneForce');
	let tries = clickedButton.getAttribute('tries');
	tries = parseInt(tries);
	tries -= 1;
	if (tries < 0) {
		tries = 0;
	}
	clickedButton.setAttribute('tries', tries);
	if (tries > 0) {
		clickedButton.textContent = `Weekly:${tries}/3`;
	} else {
		clickedButton.disabled = true;
		clickedButton.textContent = 'Done!';
	}
}

async function getExp(forceType, forceName) {
	const forceTypeMap = {
		ArcaneForce: characterData.ArcaneForce,
		SacredForce: characterData.SacredForce,
		GrandSacredForce: characterData.GrandSacredForce,
	};
	const forceTypeTable = {
		ArcaneForce: ArcaneTable,
		SacredForce: SacredTable,
		GrandSacredForce: GrandSacredTable,
	};
	const forceTypeLevel = {
		ArcaneForce: 20,
		SacredForce: 11,
		GrandSacredForce: 11,
	};

	const forceArray = forceTypeMap[forceType];
	const expTable = forceTypeTable[forceType];
	const maxLevel = forceTypeLevel[forceType];

	// Find the force object
	let object = forceArray.find((force) => force.name === forceName);

	// Check if the level is below the max level
	if (object.level >= maxLevel) {
		return 'MAX';
	}

	// Return the required EXP
	return expTable.level[object.level]?.EXP ?? 'EXP data not found';
}

async function postRequest(postData, URL) {
	await fetch(URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(postData),
	});
}

async function updateArea(forceName, forceType) {
	// Fetch character data
	characterData = await fetchCharacterData(username, server, characterCode);

	// Mapping force types to their respective data and properties
	const forceTypeMap = {
		ArcaneForce: characterData.ArcaneForce,
		SacredForce: characterData.SacredForce,
		GrandSacredForce: characterData.GrandSacredForce,
	};

	const areaPropertyMap = {
		ArcaneForce: 'ArcaneForceLevel',
		SacredForce: 'SacredForceLevel',
		GrandSacredForce: 'GrandSacredForceLevel',
	};

	// Get the relevant force array and area property
	const forceArray = forceTypeMap[forceType];
	const areaProperty = areaPropertyMap[forceType];
	const areaData = forceArray.find((force) => force.name === forceName);

	// Update the DOM elements
	const targetDiv = document.querySelector(`div[area="${forceName}"]`);
	const ForceLevel = targetDiv.querySelector(`.${areaProperty}`);
	const ForceEXPNumber = targetDiv.querySelector('.expNumber');
	const innerExpBar = targetDiv.querySelector('.progressBar');
	const daysToMaxElement = targetDiv.querySelector('.daysToMax');
	const Buttons = targetDiv.querySelector('.buttons');

	// Update force level
	ForceLevel.textContent = `Level: ${areaData.level}`;

	// Calculate and update EXP
	const isArcane = forceType === 'ArcaneForce';
	const nextLevelEXPNumber = await getExp(forceType, forceName);

	ForceEXPNumber.textContent = `${areaData.exp}/${nextLevelEXPNumber}`;

	// Handle max level case
	const isMaxLevel = (isArcane && areaData.level === 20) || (!isArcane && areaData.level === 11);
	if (isMaxLevel) {
		ForceEXPNumber.textContent = `${nextLevelEXPNumber}`;
		innerExpBar.style.backgroundColor = '#48AA39';
		daysToMaxElement?.remove();
		Buttons?.remove();
		return; // Exit early if max level is reached
	}

	// Update progress bar and days to max
	await updateExpBar(innerExpBar, areaData.exp, nextLevelEXPNumber, 12.083, characterData.jobType);
	const remainDays = await updateDayToMax(areaData, isArcane);
	daysToMaxElement.textContent = isArcane ? `Days to Level 20: ${remainDays}` : `Days to Level 11: ${remainDays}`;
}
async function updateDayToMax(areaData, isArcane) {
	let expTable = isArcane ? ArcaneTable : SacredTable;

	if (!expTable) {
		expTable = GrandSacredTable;
	}

	const weeklyValue = Number(dailyJson.find((json) => json.name === 'Weekly')?.value);

	// Calculate total experience required
	const totalExpRequired = calculateTotalExp(areaData.level, expTable) - areaData.exp;

	// Get daily experience and event bonus
	const dailyExp = getDailyValue(areaData, isArcane);
	const eventBonus = parseFloat(getCookie('eventBonus')) || 0;

	// Calculate weekly experience contribution if applicable
	const weeklyExp = isArcane && areaData.content[1]?.checked ? weeklyValue * 3 : 0;

	// Calculate the required days
	const dailyTotalExp = dailyExp + weeklyExp / 7 + eventBonus;

	return Math.ceil(totalExpRequired / dailyTotalExp);
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
			await processNextButton();
		}
	}

	await processNextButton();
}

async function updateEventBonus(event) {
	const value = event.target.value;
	setCookie('eventBonus', value, 90);
	updateEventBonusButton(value);
	await updateDailyValue(value);
}
async function updateDailyValue(value) {
	const buttons = document.querySelectorAll('.dailyButton');

	for (const button of buttons) {
		const forceName = button.getAttribute('name');
		const isArcane = button.getAttribute('arcane') === 'true';

		const oldValue = button.getAttribute('bonusevent');
		const dailyValue = button.getAttribute('value');

		const updatedValue = +value - +oldValue;
		const newValue = +dailyValue + +updatedValue;
		button.setAttribute('value', newValue);
		button.setAttribute('bonusevent', value);
		if (button.disabled != true) {
			button.textContent = `Daily: +${newValue}`;
		}

		await updateArea(forceName, isArcane);
	}
}
