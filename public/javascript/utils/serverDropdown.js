async function loadServerButtons(data, parentDiv) {
	const dropdownToggle = createDOMElement('button', 'dropdownToggle');
	dropdownToggle.id = 'dropdownToggle';

	const serverSelector = createDOMElement('div', 'serverSelector');
	const selectedServer = createDOMElement('div', 'selectedServer');

	const arrowSVG = await createArrowSVG();
	const savedServerContent = getCookie('selectedServerContent');

	selectedServer.appendChild(arrowSVG);

	let isFirstButton = true;

	try {
		const serverDataPromises = data.map(async (serverID) => {
			const response = await fetch(`/serverName/${serverID}`);
			return response.json();
		});

		const serverDataArray = await Promise.all(serverDataPromises);

		const fragment = document.createDocumentFragment();

		for (const serverData of serverDataArray) {
			const createdButton = await createServerButton(serverData);

			if (isFirstButton) {
				createdSelectedButton = createdButton.cloneNode(true);
				createdSelectedButton.classList.replace(
					'serverButton',
					'SelectedButton',
				);

				const svgElement = createdSelectedButton.querySelector('svg');
				createdSelectedButton.removeChild(svgElement);

				selectedServer.insertBefore(
					createdSelectedButton,
					selectedServer.firstChild,
				);
				createdSelectedButton.classList.toggle('notSelected');

				if (savedServerContent) {
					updateToCookie(selectedServer, savedServerContent);
				} else {
					createdSelectedButton.classList.toggle('selected');
				}
				isFirstButton = false;
			}

			if (
				createdButton.querySelector('span').textContent ===
				savedServerContent
			) {
				createdButton.classList.toggle('notSelected');
				createdButton.classList.toggle('selected');
			}
			fragment.appendChild(createdButton);
		}
		serverSelector.appendChild(fragment);
	} catch (error) {
		console.error('Error fetching server name:', error);
	}
	const serverToCheck = selectedServer
		.querySelector('span')
		.textContent.trim();

	const buttons = Array.from(
		serverSelector.querySelectorAll('.serverButton'),
	);

	const matchedButtons = buttons.filter((button) => {
		const span = button.querySelector('span');
		return span && span.textContent.trim() === serverToCheck;
	});

	if (matchedButtons.length > 0) {
		matchedButtons[0].classList.remove('notSelected');
		matchedButtons[0].classList.add('selected');
	}

	dropdownToggle.appendChild(selectedServer);
	dropdownToggle.appendChild(serverSelector);
	parentDiv.appendChild(dropdownToggle);
}

async function createServerButton(serverData) {
	const createdButton = createDOMElement('button', 'serverButton');

	const serverImage = await createImageElement(
		`${serverData.img}.webp`,
		serverData.name,
		'serverIcon',
	);
	const serverNameSpan = createDOMElement('span', '', serverData.name);
	const checkSVG = createCheckSVG();

	createdButton.appendChild(serverImage);
	createdButton.appendChild(serverNameSpan);
	createdButton.appendChild(checkSVG);

	createdButton.classList.toggle('notSelected');

	return createdButton;
}

function createCheckSVG() {
	const checkSVG = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'svg',
	);
	checkSVG.setAttribute('width', '30');
	checkSVG.setAttribute('height', '30');
	checkSVG.setAttribute('viewBox', '0 0 36 27');
	checkSVG.setAttribute('fill', 'none');

	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute(
		'd',
		'M12 21.4L3.59999 13L0.799988 15.8L12 27L36 2.99995L33.2 0.199951L12 21.4Z',
	);
	path.setAttribute('fill', '#E3E3E3');

	checkSVG.appendChild(path);
	return checkSVG;
}

async function createArrowSVG() {
	const svgElement = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'svg',
	);
	svgElement.setAttribute('id', 'icon');
	svgElement.setAttribute('width', '30px');
	svgElement.setAttribute('height', '30px');
	svgElement.setAttribute('viewBox', '0 0 1024 1024');
	svgElement.setAttribute('class', 'icon');

	const pathElement = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'path',
	);
	pathElement.setAttribute(
		'd',
		'M917.333333 364.8L851.2 298.666667 512 637.866667 172.8 298.666667 106.666667 364.8 512 768z',
	);
	pathElement.setAttribute('fill', '#F6F6F6');
	svgElement.appendChild(pathElement);
	return svgElement;
}

function setupDropdownToggle() {
	const dropdownToggle = document.querySelector('.dropdownToggle');
	const svgIcon = dropdownToggle.querySelector('.icon');
	let isOpen = false;

	dropdownToggle.addEventListener('click', function () {
		isOpen = !isOpen;

		dropdownToggle.classList.toggle('open', isOpen);
		dropdownToggle.classList.toggle('closed', !isOpen);
		svgIcon.classList.toggle('rotate', isOpen);
	});
}

function swapContentAndStoreCookie(selectedButton, serverButton) {
	const selectedImage = selectedButton.querySelector('img');
	const selectedName = selectedButton.querySelector('span');

	const serverImage = serverButton.querySelector('img');
	const serverNameSpan = serverButton.querySelector('span');

	selectedImage.setAttribute('alt', serverNameSpan.textContent);
	selectedImage.src = serverImage.src;
	selectedName.textContent = serverNameSpan.textContent;

	setCookie(
		'selectedServerContent',
		serverNameSpan.textContent.toLowerCase(),
		7,
	);
}

function updateToCookie(selectedServer, savedServerContent) {
	const selectedServerImg = selectedServer.querySelector('img');
	const newImgSrc = `/../../assets/icons/servers/${savedServerContent}.webp`;
	selectedServerImg.src = newImgSrc;
	selectedServerImg.setAttribute('alt', savedServerContent);
	selectedServer.querySelector('span').textContent =
		savedServerContent.charAt(0).toUpperCase() +
		savedServerContent.slice(1);
	return;
}
