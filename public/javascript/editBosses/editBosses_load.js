window.bossList;
window.bossJson;
window.server;
window.serverType;
window.selectedList;
window.Character;
window.username;
window.crystalLimit = 180;

document.addEventListener('DOMContentLoaded', async () => {
	server = getCookie('selectedServerContent');
	if (server == undefined) {
		server = 'scania';
		setCookie('selectedServerContent', server, 30);
	}

	await fetchBossList();

	server = selectedList.name;
	Character = selectedList.characters[0];

	await loadPage();
	document.dispatchEvent(new Event('PageLoaded'));
});

async function fetchBossList() {
	try {
		username = document.getElementById('userdata').getAttribute('data-username');
		username = DOMPurify.sanitize(username);

		bossList = await fetch(`/bossList/${username}`).then((response) => response.json());

		bossJson = await fetch('../../../public/data/bosses.json').then((response) => response.json());

		selectedList = bossList.server;
		selectedList = selectedList.find((servers) => servers.name === server.charAt(0).toUpperCase() + server.slice(1));
		serverType = selectedList.type;
	} catch (error) {
		console.error('Error fetching character data:', error);
	}
}

async function loadPage() {
	await loadTopButtons();

	if (Character) {
		await loadCharacterSelector();
		await loadCharacterIncome();
		await loadWeeklyBossesCharacter();
		await loadMonthlyBossesCharacter();
		await loadBosses();
	} else {
		await loadMissingCharacter();
	}
}

async function loadTopButtons() {
	await createBossingLogo();
	await createTotalSelected();
	await createTotalIncome();
}

async function createBossingLogo() {
	const parentDiv = document.querySelector('.bossDiv');

	const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
	const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');

	const pathElements = bossIcon.querySelectorAll('path');
	pathElements.forEach((path) => {
		path.setAttribute('fill', '#3D3D3D');
	});

	const bossSpan = createDOMElement('span', 'bossHunting', 'Boss Hunting');
	bossSpan.textContent = DOMPurify.sanitize(bossSpan.textContent);

	parentDiv.appendChild(bossIcon);
	parentDiv.appendChild(bossSpan);
}

async function createTotalSelected() {
	const parentDiv = document.querySelector('.totalSelectedDiv');

	const totalBosses = await calculateTotalBosses();
	const totalSelectedBosses = createDOMElement('span', 'totalSelectedBosses', `${totalBosses}/${crystalLimit}`);

	const textDiv = document.querySelector('.WeekTextDiv');

	textDiv.appendChild(totalSelectedBosses);
	parentDiv.appendChild(textDiv);
}

async function calculateTotalBosses() {
	let totalBosses = 0;
	for (characters of selectedList.characters) {
		for (bosses of characters.bosses) {
			if (bosses.reset === 'Daily') {
				totalBosses += Number(bosses.DailyTotal);
			} else {
				totalBosses++;
			}
		}
	}
	return totalBosses;
}

async function createTotalIncome() {
	const parentDiv = document.querySelector('.totalIncomedDiv');

	const IncomeTextDiv = document.querySelector('.IncomeTextDiv');

	const totalIncome = Character ? await calculateTotalIncome() : 0;

	const totalIncomeSpan = createDOMElement('span', 'TotalIncome', totalIncome);
	totalIncomeSpan.style.fontSize = (await adjustFontSizeToFit(totalIncomeSpan, 11.667, 2)) + 'rem';

	IncomeTextDiv.appendChild(totalIncomeSpan);
	parentDiv.appendChild(IncomeTextDiv);
}
async function calculateTotalIncome() {
	let grandTotalIncome = 0;

	selectedList.characters.forEach((character) => {
		let characterIncome = 0;
		console.log(selectedList);
		character.bosses.forEach((boss) => {
			const bossInfo = bossJson.find((b) => b.name === boss.name);

			if (bossInfo) {
				const difficultyInfo = bossInfo.difficulties.find((d) => d.name === boss.difficulty);
				if (difficultyInfo) {
					let income = selectedList.type == 'Reboot' ? difficultyInfo.value * 5 : difficultyInfo.value;

					if (difficultyInfo.reset === 'Daily' && boss.DailyTotal) {
						income *= boss.DailyTotal;
					}

					characterIncome += income;
				}
			}
		});
		grandTotalIncome += characterIncome;
	});

	return grandTotalIncome.toLocaleString('en-US');
}

async function loadCharacterSelector() {
	const parentDiv = document.querySelector('.characterSelector');

	const dropdownToggle = createDOMElement('button', 'dropdownToggle');
	dropdownToggle.id = 'dropdownToggle';

	const selectedCharacter = createDOMElement('div', 'selectedCharacter');
	const arrowSVG = await createArrowSVG('#3D3D3D', '48px');

	const characterContent = createDOMElement('div', 'characterContent');

	const fragment = document.createDocumentFragment();

	let isFirstButton = true;

	for (character of selectedList.characters) {
		const createdButton = await createCharacterButton(character);
		createdButton.classList.toggle('notSelected');
		if (isFirstButton) {
			const createdSelectedButton = createdButton.cloneNode(true);

			createdSelectedButton.classList.replace('characterButton', 'SelectedCharacterButton');
			createdSelectedButton.appendChild(arrowSVG);

			selectedCharacter.appendChild(createdSelectedButton);
			isFirstButton = false;
			createdButton.classList.toggle('selected');
			createdButton.classList.toggle('notSelected');
			createdSelectedButton.classList.toggle('notSelected');
			const checkSVG = await createCheckSVG();
			createdButton.appendChild(checkSVG);
		}

		fragment.appendChild(createdButton);
		characterContent.appendChild(fragment);
	}

	const dropdown = createDOMElement('div', 'dropdown');
	dropdownToggle.appendChild(selectedCharacter);
	dropdownToggle.appendChild(characterContent);
	dropdown.appendChild(dropdownToggle);
	parentDiv.appendChild(dropdown);
}

async function loadCharacterIncome() {
	const parentDiv = document.querySelector('.characterIncomeDiv');

	const IncomeTextDiv = parentDiv.querySelector('.IncomeTextDiv');

	const totalIncome = await calculateTotalIncomeForCharacter();

	const totalIncomeSpan = createDOMElement('span', 'characterTotalIncome', `${totalIncome}`);
	totalIncomeSpan.style.fontSize = (await adjustFontSizeToFit(totalIncomeSpan, 11.667, 2)) + 'rem';

	IncomeTextDiv.appendChild(totalIncomeSpan);
}

async function calculateTotalIncomeForCharacter() {
	let characterIncome = 0;
	//console.log(Character);
	Character.bosses.forEach((boss) => {
		const bossInfo = bossJson.find((b) => b.name === boss.name);
		if (bossInfo) {
			const difficultyInfo = bossInfo.difficulties.find((d) => d.name === boss.difficulty);

			if (difficultyInfo) {
				let income = selectedList.type == 'Reboot' ? difficultyInfo.value * 5 : difficultyInfo.value;

				if (difficultyInfo.reset === 'Daily' && boss.DailyTotal) {
					income *= boss.DailyTotal;
				}

				characterIncome += income;
			}
		}
	});
	return characterIncome.toLocaleString('en-US');
}

function createCheckSVG() {
	const checkSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	checkSVG.setAttribute('width', '30');
	checkSVG.setAttribute('height', '30');
	checkSVG.setAttribute('viewBox', '0 0 36 27');
	checkSVG.setAttribute('fill', 'none');

	// Sanitize the path data
	const pathData = 'M12 21.4L3.59999 13L0.799988 15.8L12 27L36 2.99995L33.2 0.199951L12 21.4Z';
	const sanitizedPathData = DOMPurify.sanitize(pathData);

	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute('d', sanitizedPathData); // Set sanitized data
	path.setAttribute('fill', '#3D3D3D');

	checkSVG.appendChild(path);
	return checkSVG;
}
async function createCharacterButton(character) {
	const characterButton = createDOMElement('button', 'characterButton');
	const imgSource = `../../public/assets/buttom_profile/${getCode(character)}.webp`;

	const characterImage = await createImageElement(imgSource, 'character Profile', 'profile');

	const characterName = createDOMElement('span', 'characterName', `${character.name}`);
	const characterClass = createDOMElement('span', 'characterClass', `${character.class}`);

	const characterWrapper = createDOMElement('div', 'characterWrapper');

	// Sanitize character name and class before appending them
	characterName.textContent = DOMPurify.sanitize(characterName.textContent);
	characterClass.textContent = DOMPurify.sanitize(characterClass.textContent);

	characterWrapper.appendChild(characterName);
	characterWrapper.appendChild(characterClass);

	characterButton.appendChild(characterImage);
	characterButton.appendChild(characterWrapper);

	return characterButton;
}

const classTag = {
	Easy: { tag: 'easyButton' },
	Normal: { tag: 'normalButton' },
	Hard: { tag: 'hardButton' },
	Chaos: { tag: 'chaosButton' },
	Extreme: { tag: 'extremeButton' },
};

async function loadBosses() {
	const parentDiv = document.querySelector('.bosses');

	const loader = createDOMElement('span', 'loader');
	loader.style.marginTop = '259px';
	loader.style.marginLeft = '798px';
	loader.style.marginBottom = '208px';
	parentDiv.appendChild(loader);

	const jsonPath = '../../../public/data/bosses.json';
	bossJson = await fetch(jsonPath).then((response) => response.json());

	const bossGrid = createDOMElement('div', 'bossGrid');
	for (const boss of bossJson) {
		const morethan4 = boss.difficulties.length > 3;

		let totalIncoming = 0;
		const checkedBoss = Character.bosses.filter((obj) => obj.name === boss.name);

		const bossSlot = createDOMElement('div', 'bossSlot');
		const bossBox = createDOMElement('div', 'bossBox');

		const image = await createImageElement(boss.img, `${boss.name}`, 'bossPicture');
		const name = createDOMElement('span', 'bossName', boss.name);
		name.style.fontSize = (await adjustFontSizeToFit(name, 6.458, 2)) + 'rem';

		// Sanitize boss name before appending it
		name.textContent = DOMPurify.sanitize(name.textContent);

		bossBox.appendChild(image);
		bossBox.appendChild(name);

		const buttonDiv = createDOMElement('div', 'buttonDiv');

		for (difficult of boss.difficulties) {
			const difficultyFound = checkedBoss.filter((obj) => obj.difficulty === difficult.name);

			const { tag } = classTag[difficult.name];

			const difficultButton = createDOMElement('button', `${tag}`);
			const difficultButtonText = createDOMElement('span', 'buttonText', `${difficult.name}`);

			difficultButtonText.textContent = DOMPurify.sanitize(difficultButtonText.textContent);

			if (morethan4) {
				difficultButtonText.style.fontSize = '0.813rem';
			}

			const value = serverType == 'Reboot' ? difficult.value * 5 : difficult.value;

			difficultButton.appendChild(difficultButtonText);
			difficultButton.setAttribute('value', value);
			difficultButton.setAttribute('reset', `${difficult.reset}`);
			difficultButton.setAttribute('name', `${difficult.name}`);
			difficultButton.setAttribute('minLevel', `${difficult.minLevel}`);

			const LevelRequirmentOK = Character.level >= difficult.minLevel;

			if (!LevelRequirmentOK) {
				await updateButtonToBlock(difficultButton);
			}

			if (difficult.reset === 'Daily' && LevelRequirmentOK) {
				const dailyTotal = difficultyFound[0] !== undefined ? difficultyFound[0].DailyTotal : 0;
				totalIncoming += Number(value) * Number(dailyTotal);
				await insertDropdownOnButton(difficultButton, dailyTotal);
			}

			if (checkedBoss.length > 0) {
				if (difficultyFound.length > 0) {
					if (difficultyFound[0].reset !== 'Daily') {
						const color = bossesButtonColors[difficult.name].color;
						const checkMark = await createCheckMark(color, 20);
						difficultButton.appendChild(checkMark);
						totalIncoming += value;
					}
				}
			}
			buttonDiv.appendChild(difficultButton);
		}

		bossBox.append(buttonDiv);
		const totalBossIncome = createDOMElement('span', 'totalBossIncome', totalIncoming.toLocaleString('en-us'));
		totalBossIncome.style.display = 'none';

		bossBox.appendChild(totalBossIncome);
		bossBox.setAttribute('totalIncome', totalIncoming);

		if (totalIncoming > 0) {
			totalBossIncome.style.display = 'block';
			totalBossIncome.style.fontSize = (await adjustFontSizeToFit(totalBossIncome, 6.146, 1)) + 'rem';
			bossBox.classList.add('open');
		}

		bossSlot.appendChild(bossBox);
		bossGrid.appendChild(bossSlot);
	}

	const loaderSpan = parentDiv.querySelector('.loader');
	if (loaderSpan) parentDiv.removeChild(loaderSpan);

	parentDiv.appendChild(bossGrid);
}

async function loadWeeklyBossesCharacter() {
	const parentDiv = document.querySelector('.characterWeeklyDiv');

	const bossCounterDiv = parentDiv.querySelector('.characterWeeklyTextDiv');

	const weeklyBossesCount = Character.bosses.filter((boss) => boss.reset === 'Weekly').length;

	const totalIncomeSpan = createDOMElement('span', 'characterTotalIncome', `${weeklyBossesCount}/14`);
	totalIncomeSpan.style.fontSize = (await adjustFontSizeToFit(totalIncomeSpan, 11.667, 2)) + 'rem';

	bossCounterDiv.appendChild(totalIncomeSpan);
}

async function loadMonthlyBossesCharacter() {
	const parentDiv = document.querySelector('.characterMonthlyDiv');

	const bossCounterDiv = parentDiv.querySelector('.characterMonthlyTextDiv');

	const weeklyBossesCount = Character.bosses.filter((boss) => boss.reset === 'Monthly').length;

	const totalIncomeSpan = createDOMElement('span', 'characterTotalIncome', `${weeklyBossesCount}/1`);
	totalIncomeSpan.style.fontSize = (await adjustFontSizeToFit(totalIncomeSpan, 11.667, 2)) + 'rem';

	bossCounterDiv.appendChild(totalIncomeSpan);
}

async function updateWeeklyBossesCharacter() {
	const bossCounterDiv = document.querySelector('.characterWeeklyTextDiv');
	const weeklyBossesCount = Character.bosses.filter((boss) => boss.reset === 'Weekly').length;
	const totalIncomeSpan = bossCounterDiv.querySelector('.characterTotalIncome');

	totalIncomeSpan.textContent = `${weeklyBossesCount}/14`;
}

async function updateMonthlyBossesCharacter() {
	const bossCounterDiv = document.querySelector('.characterMonthlyTextDiv');
	const weeklyBossesCount = Character.bosses.filter((boss) => boss.reset === 'Monthly').length;
	const totalIncomeSpan = bossCounterDiv.querySelector('.characterTotalIncome');

	totalIncomeSpan.textContent = `${weeklyBossesCount}/1`;
}
