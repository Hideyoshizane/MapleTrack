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

	let isArcane = clickedButton.getAttribute('Arcane');
	isArcane = isArcane.toLowerCase() === 'true';
	const forceName = clickedButton.getAttribute('name');
	const neededExp = await getExp(isArcane, forceName);
	const currentDate = DateTime.utc();

	const postData = {
		forceType: isArcane,
		forceName: forceName,
		value: dailyValue,
		characterData: characterData,
		necessaryExp: neededExp,
		date: currentDate,
	};
	const URL = '/increaseDaily';
	await postRequest(postData, URL);
	await updateArea(forceName, isArcane);

	clickedButton.disabled = true;
	clickedButton.textContent = 'Daily done!';
}

async function increaseWeekly(event) {
	const clickedButton = event.target;
	const forceName = clickedButton.getAttribute('area');
	const neededExp = await getExp(true, forceName);
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
	await updateArea(forceName, true);
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

async function getExp(isArcane, forceName) {
	const object = isArcane
		? characterData.ArcaneForce.find((arcaneforce) => arcaneforce.name === forceName)
		: characterData.SacredForce.find((sacredforce) => sacredforce.name === forceName);

	const expTable = isArcane ? ArcaneTable : SacredTable;

	if (object.level < (isArcane ? 20 : 11)) {
		return expTable.level[object.level].EXP;
	} else {
		return 'MAX';
	}
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

async function updateArea(forceName, isArcane) {
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

	if ((isArcane && areaData.level === 20) || (!isArcane && areaData.level === 11)) {
		ForceEXPNumber.textContent = `${nextLevelEXPNumber}`;
	}

	innerExpBar = targetDiv.querySelector('.progressBar');

	await updateExpBar(innerExpBar, areaData.exp, nextLevelEXPNumber, 12.083, characterData.jobType);

	if ((isArcane && areaData.level === 20) || (!isArcane && areaData.level === 11)) {
		const Buttons = targetDiv.querySelector('.buttons');
		const daysToMaxRemove = targetDiv.querySelector('.daysToMax');
		innerExpBar.style.backgroundColor = '#48AA39';
		daysToMaxRemove.remove();
		Buttons.remove();
	}
}

async function updateDayToMax(areaData, isArcane) {
	const expTable = isArcane ? ArcaneTable : SacredTable;

	const weeklyValue = Number(dailyJson.find((json) => json.name === 'Weekly').value);
	let totalExp = calculateTotalExp(areaData.level, expTable);
	let dailyExp = getDailyValue(areaData, isArcane);
	const EventBonusValue = +getCookie('eventBonus');

	const weeklyExp = areaData.content[1] && areaData.content[1].checked && isArcane ? weeklyValue * 3 : 0;
	totalExp -= areaData.exp;
	return Math.ceil(totalExp / (dailyExp + weeklyExp + EventBonusValue / 7));
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
	const buttons = document.querySelectorAll('.dailyButton:not([disabled])');

	for (const button of buttons) {
		const forceName = button.getAttribute('name');
		const isArcane = button.getAttribute('arcane') === 'true';

		const oldValue = button.getAttribute('bonusevent');
		const dailyValue = button.getAttribute('value');

		const updatedValue = +value - +oldValue;
		const newValue = +dailyValue + +updatedValue;

		button.setAttribute('value', newValue);
		button.setAttribute('bonusevent', value);

		button.textContent = `Daily: +${newValue}`;

		await updateArea(forceName, isArcane);
	}
}
