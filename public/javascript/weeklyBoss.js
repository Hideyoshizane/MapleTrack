window.bossList;
window.server;

document.addEventListener('DOMContentLoaded', async () => {
    server = getCookie('selectedServerContent');
    await fetchBossList();
})

  //document.getElementById("userdata").getAttribute('data-username');

async function fetchBossList(){
  try {
    const username = 'hideyoshi';
  
    const response =  await fetch(`/bossList/${username}`);
    console.log(response);

  } catch (error) {
    console.error('Error fetching character data:', error);
  }
}

function createDOMElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
  
    if (className) {
      element.classList.add(className);
    }
  
    if (content !== '') {
      element.textContent = content;
    }
  
    return element;
  }

  async function createImageElement(src, alt, className = '') {
    const image = createDOMElement('img', className);
    image.src = src;
    image.alt = alt;
  
    await image.decode();
    return image;
  }


async function loadPage(){
    await loadTopButtons();
    await loadCharacterCards();
}

async function loadTopButtons(){
    await createBossingLogo();
    await createWeekProgress();
    //await createTotalGain();
    //await createServerButton();
    //await createEditBossesButton();
}

async function createBossingLogo(){
    const parentDiv = document.querySelector('.topButtons');

    const bossDiv = createDOMElement('div', 'bossDiv');
    
    const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
    const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');

    const bossSpan = createDOMElement('span', 'bossHunting', 'Boss Hunting');

    bossDiv.appendChild(bossIcon);
    bossDiv.appendChild(bossSpan);

    parentDiv.appendChild(bossDiv);
}

async function loadEditableSVGFile(filePath, className) {
    try {
      const response = await fetch(filePath);
      const svgData = await response.text();
  
      const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
     
      svgElement.innerHTML = svgData;
  
      if (className) {
        svgElement.classList.add(className);
      }
  
      const pathElements = svgElement.querySelectorAll("path");

      pathElements.forEach((path) => {
        path.setAttribute("fill", '#3D3D3D');
      });
      
      return svgElement;
  
    } catch (error) {
      console.error("Error loading SVG file:", error);
      return null;
    }
  }

async function createWeekProgress(){
    const username = document.getElementById("userdata").getAttribute('data-username');
    //const userData = await fetch('/username').then(response => response.json());

    const parentDiv = document.querySelector('.topButtons');
    const WeekProgressDiv = createDOMElement('div', 'WeekProgressDiv');
    const crystal = await createImageElement(`../../public/assets/icons/menu/crystal.webp`,'Boss Crystal Icon', 'crystalIcon');

    const WeekProgress = createDOMElement('span','WeekProgress', 'Week Progress');

    WeekProgressDiv.appendChild(crystal);
    parentDiv.appendChild(WeekProgressDiv);

}


async function createTotalGain(){

}
async function createServerButton() {
	const parentDiv = document.querySelector('.topButtons');

	const data = await fetch('/userServer').then((response) => response.json());
	const savedServerContent = getCookie('selectedServerContent');
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
					'SelectedButton'
				);

				const svgElement = createdSelectedButton.querySelector('svg');
				createdSelectedButton.removeChild(svgElement);

				selectedServer.insertBefore(
					createdSelectedButton,
					selectedServer.firstChild
				);
				createdSelectedButton.classList.toggle('not-checked');

				if (savedServerContent) {
					updateToCookie(selectedServer, savedServerContent);
				} else {
					createdSelectedButton.classList.toggle('checked');
				}
				isFirstButton = false;
			}

			if (
				createdButton.querySelector('span').textContent === savedServerContent
			) {
				createdButton.classList.toggle('not-checked');
				createdButton.classList.toggle('checked');
			}
			fragment.appendChild(createdButton);
		}
		parentDiv.appendChild(fragment);
	} catch (error) {
		console.error('Error fetching server name:', error);
	}
}
/*
async function createServerButton(serverData) {

  const createdButton = createDOMElement('button', 'serverButton');
  const serverImage = await createImageElement(`${serverData.img}.webp`, serverData.name, 'serverIcon');
  const serverNameSpan = createDOMElement('span', '', serverData.name);
  const checkSVG = createCheckSVG();

  createdButton.appendChild(serverImage);
  createdButton.appendChild(serverNameSpan);
  createdButton.appendChild(checkSVG);

  createdButton.classList.toggle('not-checked');

  return createdButton;

}*/

function createCheckSVG(){
  const checkSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  checkSVG.setAttribute('width', '30');
  checkSVG.setAttribute('height', '30');
  checkSVG.setAttribute('viewBox', '0 0 36 27');
  checkSVG.setAttribute('fill', 'none');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 21.4L3.59999 13L0.799988 15.8L12 27L36 2.99995L33.2 0.199951L12 21.4Z');
  path.setAttribute('fill', '#E3E3E3');

  checkSVG.appendChild(path);
  return checkSVG;
}


async function createEditBossesButton(){

}
  

async function loadCharacterCards(){


}

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

  // Check if the cookie is 'selectedServerContent'
  const path = name === 'selectedServerContent' ? '/' : '';

  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=${path}`;
}



function getCookie(name) {
  const cookieArr = document.cookie.split(';');
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=');
    if (cookiePair[0].trim() === name) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}

function updateToCookie(selectedServer, savedServerContent){
  const selectedServerImg = selectedServer.querySelector('img');
  const currentImgSrc = selectedServerImg.getAttribute('src');
  const newImgSrc = currentImgSrc.replace(/[^/]*\.webp$/, `${savedServerContent}.webp`);
  selectedServerImg.src = newImgSrc;
  selectedServerImg.setAttribute('alt', savedServerContent);
  selectedServer.querySelector('span').textContent = savedServerContent;

}