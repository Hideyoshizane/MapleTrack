document.addEventListener('PageLoaded', async () => {
	try {
		const bossSwitch = document.querySelector(
			'.bossSwitch input[type="checkbox"]',
		);
		bossSwitch.addEventListener('change', () => {
			changebossIcon(bossSwitch.checked);
		});

		const discardButton = document.querySelector('.discardButton');
		discardButton.addEventListener('click', () => {
			var url = `/${username}/${server}/${characterCode}`;
			window.location.href = url;
		});

		let saveButton = document.querySelector('.saveButton');
		saveButton.addEventListener('click', async () => {
			await saveDataAndPost();
		});
		if (saveButton.disabled) {
			saveButton.addEventListener('mouseover', async () => {
				if (saveButton.disabled) {
					handleHover(saveButton);
				}
			});
			saveButton.addEventListener('mouseout', async () => {
				handleMouseOut();
			});
		}

		const characterName = document.querySelector('.characterName');
		const levelNumber = document.querySelector('.levelNumber');
		const levelTarget = document.querySelector('.levelTarget');

		characterName.addEventListener('input', async () => {
			const valid = isValidCharacterName(characterName.value);
			characterName.style.color = valid ? '#000000' : '#C33232';
			saveButton.disabled = !valid;
			if (saveButton.disabled) {
				saveButton.addEventListener('mouseover', async () => {
					if (saveButton.disabled) {
						handleHover(saveButton);
					}
				});
				saveButton.addEventListener('mouseout', async () => {
					handleMouseOut();
				});
			}
		});

		levelNumber.addEventListener('input', async () => {
			const levelNumberValue = levelNumber.value;

			await updateClass(levelNumberValue);
			await updateLegion(levelNumberValue);
		});

		levelNumber.addEventListener('blur', async function () {
			const level = levelNumber.value;
			await updateForce('Arcane', level);
			await updateForce('Sacred', level);

			const levelNumberValue =
				levelNumber.value || levelNumber.placeholder;
			const levelTargetValue =
				levelTarget.value || levelTarget.placeholder;
			const jobType = document
				.querySelector('.characterLevelBar')
				.getAttribute('jobType');
			const progressBar = document.querySelector('.progressBar');

			await updateExpBar(
				progressBar,
				levelNumberValue,
				levelTargetValue,
				41.458,
				jobType,
			);
		});

		levelTarget.addEventListener('input', async () => {
			const levelNumberValue = levelNumber.value;

			await updateClass(levelNumberValue);
		});

		levelTarget.addEventListener('blur', async function () {
			const levelNumberValue =
				levelNumber.value || levelNumber.placeholder;
			const levelTargetValue =
				levelTarget.value || levelTarget.placeholder;
			const jobType = document
				.querySelector('.characterLevelBar')
				.getAttribute('jobType');
			const progressBar = document.querySelector('.progressBar');

			await updateExpBar(
				progressBar,
				levelNumberValue,
				levelTargetValue,
				41.458,
				jobType,
			);
		});

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

async function changebossIcon(checked) {
	const bossIcon = document.querySelector('.bossIcon');
	const bossIconPath = checked
		? '../../../public/assets/icons/menu/boss_slayer.svg'
		: '../../../public/assets/icons/menu/boss_slayer_off.svg';

	const bossIconElement = await loadEditableSVGFile(bossIconPath, 'bossIcon');
	bossIcon.replaceWith(bossIconElement);
}

async function updateClass(levelNumberValue) {
	const level = { level: Number(levelNumberValue) };
	targetSpan = document.querySelector('.jobLevel').textContent =
		getJob(level);
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
			(force) => force.name === areaName,
		);

		const levelWrapper = force.querySelector('.levelWrapper');
		const wrap = createDOMElement('div', 'levelWrapper');
		const minLevel = dailyJson.find(
			(json) => json.name === areaData[0].name,
		).minLevel;
		if (level < minLevel && !force.classList.contains('off')) {
			image.classList.add('off');
			force.classList.add('off');
			const level = createDOMElement(
				'span',
				`${type}ForceLevel`,
				`Level: 0`,
			);
			wrap.appendChild(level);
			levelWrapper.replaceWith(wrap);

			const checkboxContent = force.querySelector('.checkboxContent');
			const unlockText = createDOMElement(
				'span',
				'unlockText',
				`Unlock at Level ${minLevel}`,
			);
			checkboxContent.replaceWith(unlockText);
		}

		if (level >= minLevel && force.classList.contains('off')) {
			image.classList.remove('off');
			force.classList.remove('off');

			const level = createDOMElement(
				'span',
				`${type}ForceLevel`,
				`Level:`,
			);
			const levelInput = createDOMElement(
				'input',
				'levelInput',
				`${areaData[0].level}`,
			);
			const expContent = createDOMElement('span', 'expContent', 'EXP:');
			const expInput = createDOMElement(
				'input',
				'expInput',
				`${areaData[0].exp}`,
			);
			wrap.appendChild(level);
			wrap.appendChild(levelInput);
			wrap.appendChild(expContent);
			wrap.appendChild(expInput);
			levelWrapper.replaceWith(wrap);

			const unlockText = areaDiv.querySelector('.unlockText');
			let checkboxContent = createDOMElement('div', 'checkboxContent');
			for (const forceContent of areaData[0].content) {
				const matchingContent = dailyJson.find(
					(contentName) =>
						contentName.name === forceContent.contentType,
				);
				let contentValue = 0;

				if (matchingContent) {
					contentValue = matchingContent.value;
				} else {
					contentValue = dailyJson.find(
						(contentName) => contentName.name === 'Weekly',
					).value;
				}

				if (forceContent.contentType === 'Daily Quest') {
					contentValue = dailyJson.find(
						(contentName) => contentName.name === areaData[0].name,
					).value;
				}

				const checkbox = createCheckboxWithLabel(
					'forceCheckbox',
					`${forceContent.contentType}: +${contentValue}`,
					forceContent.checked,
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
		'.bossSwitch input[type="checkbox"]',
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
		const message = success
			? 'Character updated sucessfully'
			: 'There was an error updating';
		setCookieFlash('type', type, 50);
		setCookieFlash('message', message, 50);

		var url = `/${username}/${server}/${characterCode}`;
		window.location.href = url;
	} catch (error) {
		console.error('Error:', error);
	}
}

function returnForceArray(forceType) {
	const forceWrapperClass =
		forceType === 'Arcane' ? '.ArcaneForceWrapper' : '.SacredForceWrapper';
	const forceWrappers = document.querySelectorAll(forceWrapperClass);

	const ForceArray = [];

	for (const forceWrapper of forceWrappers) {
		if (!forceWrapper.classList.contains('off')) {
			const name = forceWrapper
				.querySelector(`.${forceType}ForceData`)
				.getAttribute('area');

			const levelInput = forceWrapper.querySelector(
				`.${forceType}ForceWrapper .levelInput`,
			);
			const level =
				levelInput.value <= 0
					? levelInput.placeholder
					: levelInput.value;

			const expInput = forceWrapper.querySelector(
				`.${forceType}ForceWrapper .expInput`,
			);
			const exp =
				expInput.value <= 0 ? expInput.placeholder : expInput.value;

			const checksArray = [];
			const checkboxes = forceWrapper.querySelectorAll(
				`.${forceType}ForceWrapper .forceCheckbox`,
			);

			for (const checkbox of checkboxes) {
				const checkboxName = checkbox.querySelector('span').textContent;
				const checkboxChecked = checkbox.querySelector(
					`.${forceType}ForceWrapper input[type="checkbox"]`,
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

function isValidCharacterName(characterName) {
	const minLength = 5;
	const maxLength = 20;
	const alphanumericRegex = /^[a-zA-Z0-9]+$/;

	return (
		characterName.length >= minLength &&
		characterName.length <= maxLength &&
		alphanumericRegex.test(characterName)
	);
}

function handleHover(saveButton) {
	const saveButtonCenter = getCenterPosition(saveButton);

	const text = 'Please set a valid character name.';

	const tempTooltip = createDOMElement('div', 'infoTooltip', text);

	document.body.appendChild(tempTooltip);
	const tempTooltipCenter = getCenterPosition(tempTooltip);
	document.body.removeChild(tempTooltip);

	const offsetX = saveButtonCenter.x - tempTooltipCenter.x;

	const tooltip = createDOMElement('div', 'infoTooltip', text);
	tooltip.style.top = `${saveButtonCenter.y + 60}px`;
	tooltip.style.left = `${offsetX}px`;
	document.body.appendChild(tooltip);
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
	const filteredLink = linkSkillData.find(
		(item) => item.name === characterData.linkSkill,
	).levels;
	const levelNumber = Number(document.querySelector('.levelNumber').value);

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
	const levelNumber = Number(document.querySelector('.levelNumber').value);
	const characterDataPlaceholder = {
		class: characterData.class,
		level: levelNumber,
	};

	const legionInfo = legionData.find(
		(item) => item.name === characterData.legion,
	).ranking;
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
