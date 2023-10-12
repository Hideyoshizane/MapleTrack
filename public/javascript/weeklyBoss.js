window.bossList;
window.server;

document.addEventListener('DOMContentLoaded', async () => {
    server = getCookie('selectedServerContent');
    //bossList = await fetchBossList(server);
    await loadPage();
})

async function fetchBossList(server){
  try {
    const username = document.getElementById("userdata").getAttribute('data-username');
    const response = await fetch(`/code/${username}/${server}/${characterCode}`);
    const characterData = await response.json();
    return characterData;
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
    await createTotalGain();
    await createServerButton();
    await createEditBossesButton();
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
async function createServerButton(){

}
async function createEditBossesButton(){

}
  

async function loadCharacterCards(){


}






function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
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