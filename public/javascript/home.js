
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await fetchData('/userServer');

    const serverSelector = document.getElementById('serverSelector');
    const selectedServer  = document.querySelector('.selectedServer');

    let isFirstButton = true;
    const savedServerContent = getCookie('selectedServerContent');

    for (const serverID of data) {
      try {
        const serverData = await fetchData(`/serverName/${serverID}`);
        const createdButton = createServerButton(serverData);


        if(isFirstButton){
          createdSelectedButton = createdButton.cloneNode(true);
          createdSelectedButton.classList.replace('serverButton', 'SelectedButton');

          const svgElement = createdSelectedButton.querySelector('svg');
          createdSelectedButton.removeChild(svgElement);
          
          selectedServer.insertBefore(createdSelectedButton, selectedServer.firstChild);
          createdSelectedButton.classList.toggle('not-checked');

          if(savedServerContent){
            updateToCookie(selectedServer, savedServerContent);
          }
          else{
            createdSelectedButton.classList.toggle('checked');
          }
          isFirstButton = false;
        }

        if(createdButton.querySelector('span').textContent === savedServerContent){
          createdButton.classList.toggle('not-checked');
          createdButton.classList.toggle('checked');
        }

        serverSelector.appendChild(createdButton);

      } catch (error) {
        console.error('Error fetching server name:', error);
      }
    }

    const serverButtons = serverSelector.querySelectorAll('.serverButton'); 

    let selectedButton = dropdownToggle.querySelector('.SelectedButton');
    createCharacterCards();
    
serverButtons.forEach(serverButton => {
  serverButton.addEventListener('click', () => {
    serverButtons.forEach(button => {
      if (button !== serverButton) {
        button.classList.add('not-checked');
        button.classList.remove('checked');
      }
    });

    swapContentAndStoreCookie(selectedButton, serverButton);
    serverButton.classList.toggle('not-checked');
    serverButton.classList.toggle('checked');
    //update characters Cards function goes here
  });
});
    

  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});

async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

function createServerButton(serverData) {
  const createdButton = document.createElement('button');
  createdButton.classList.add('serverButton');

  //Create selected SVG
  const checkSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  checkSVG.setAttribute('width', '30');
  checkSVG.setAttribute('height', '30');
  checkSVG.setAttribute('viewBox', '0 0 36 27');
  checkSVG.setAttribute('fill', 'none');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 21.4L3.59999 13L0.799988 15.8L12 27L36 2.99995L33.2 0.199951L12 21.4Z');
  path.setAttribute('fill', '#E3E3E3');


  checkSVG.appendChild(path);

  //Add server image
  const serverImage = document.createElement('img');
  serverImage.src = `${serverData.img}.webp`;
  serverImage.alt = serverData.name;
  serverImage.classList.add('serverIcon');
  createdButton.appendChild(serverImage);

  //Add server name
  const serverNameSpan = document.createElement('span');
  serverNameSpan.textContent = serverData.name;

  //Create button
  createdButton.appendChild(serverNameSpan);
  createdButton.appendChild(checkSVG);
  createdButton.classList.toggle('not-checked');
  return createdButton;

}

function swapContentAndStoreCookie(selectedButton, serverButton) {
  const selectedImage = selectedButton.querySelector('img');
  const selectedName = selectedButton.querySelector('span');

  const serverImage = serverButton.querySelector('img');
  const serverNameSpan = serverButton.querySelector('span');


  selectedImage.setAttribute('alt', serverNameSpan.textContent);
  selectedImage.src = serverImage.src;
  selectedName.textContent = serverNameSpan.textContent;

  setCookie('selectedServerContent', serverNameSpan.textContent);

}


(function setupDropdownToggle() {
  const dropdownToggle = document.querySelector('.dropdownToggle');
  const svgIcon = dropdownToggle.querySelector('.icon');
  let isOpen = false;

  dropdownToggle.addEventListener('click', function() {
    isOpen = !isOpen;

    dropdownToggle.classList.toggle('open', isOpen);
    dropdownToggle.classList.toggle('closed', !isOpen);
    svgIcon.classList.toggle('rotate', isOpen);
  });
})();




function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()}`;
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


const filterButtons = document.querySelectorAll('.filterButton');
const savedFilterValues = getCookie('filterValues');
const filterCookies = savedFilterValues ? savedFilterValues.split(',') : [];

// Load filter values from cookies
filterButtons.forEach(button => {
    const dataValue = button.getAttribute('data-value');
    if (filterCookies.includes(dataValue))
        button.classList.add('selected');
});

// Filter Button logic
const selectedValues = filterCookies.slice();

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('selected');
        
        const dataValue = button.getAttribute('data-value');
        if (button.classList.contains('selected')) {
            if (!selectedValues.includes(dataValue)) {
                selectedValues.push(dataValue);
            }
        } else {
            const dataIndex = selectedValues.indexOf(dataValue);
            if (dataIndex !== -1) {
                selectedValues.splice(dataIndex, 1);
            }
        }
        
        updateSelectedValuesCookie();
    });
});

function updateSelectedValuesCookie() {
    const selectedValuesString = selectedValues.join(',');
    setCookie('filterValues', selectedValuesString, 7);
}

const userDataScript = document.getElementById('userdata');
const username = userDataScript.getAttribute('data-username');

async function createCharacterCards(){
  const parentDiv = document.querySelector('.characterCards');
  const selectedServer = document.querySelector('.SelectedButton').querySelector('span').innerText;
  const characters = await fetchData(`/${username}/${selectedServer}`);
  for (characterData of characters){
    await generateCard(characterData, parentDiv);
  }
}

async function generateCard(characterData, parentDiv){
  const cardBody = document.createElement('div');

  const upperPart = document.createElement('div');
  const forceDiv = document.createElement('div');

  const arcaneForce = document.createElement('div');
  const sacredForce = document.createElement('div');

  arcaneForce.className = 'arcaneForce';
  sacredForce.className = 'sacredForce';

  //Arcame Force Block
  const spanArcaneForce = document.createElement('span');
  spanArcaneForce.innerText = 'Arcane Force';
  spanArcaneForce.className = 'Title';
  arcaneForce.appendChild(spanArcaneForce);

  for (arcaneArea of characterData.ArcaneForce) {
    const wrapper = document.createElement('div');
    wrapper.className = 'arcaneWrapper';
    const areaName = arcaneArea.name;
    const areaCode = areaName.replace(/\s+/g, '_').toLowerCase();
    forceImg = document.createElement('img');
    forceImg.src = `../../public/assets/arcane_force/${areaCode}.webp`;
    forceImg.alt = areaName;
    forceImg.className = 'ArcaneImage';

    var level = arcaneArea.level;
    if(level === 0){
      forceImg.classList.toggle('off');
    }
    if(level === 20){
      level = 'MAX';
    }
    else{
      level = 'Lv. ' + level;
    }
    const forceLevel = document.createElement('span');
    forceLevel.innerText = level;

    wrapper.appendChild(forceImg);
    wrapper.appendChild(forceLevel);
    arcaneForce.appendChild(wrapper);  
  }

    //Sacred Force Block
    const spanSacredForce = document.createElement('span');
    spanSacredForce.innerText = 'Sacred Force';
    spanSacredForce.className = 'Title';
    sacredForce.appendChild(spanSacredForce);
  
    for (sacredArea of characterData.SacredForce) {
      const wrapper = document.createElement('div');
      wrapper.className = 'sacredWrapper';
      const areaName = sacredArea.name;
      const areaCode = areaName.replace(/\s+/g, '_').toLowerCase();
      forceImg = document.createElement('img');
      forceImg.src = `../../public/assets/sacred_force/${areaCode}.webp`;
      forceImg.alt = areaName;
      forceImg.className = 'SacredImage';
  
      var level = sacredArea.level;
      if(level === 0){
        forceImg.classList.toggle('off');
      }
      if(level === 10){
        level = 'MAX';
      }
      else{
        level = 'Lv. ' + level;
      }
      const forceLevel = document.createElement('span');
      forceLevel.innerText = level;
  
      wrapper.appendChild(forceImg);
      wrapper.appendChild(forceLevel);
      sacredForce.appendChild(wrapper);  
    }

  forceDiv.appendChild(arcaneForce);
  forceDiv.appendChild(sacredForce);
  forceDiv.className = 'forceDiv';

  const portrait = document.createElement('img');
  portrait.setAttribute('class', 'cardPortrait');
  portrait.src = `../../public/assets/cards/${characterData.code}.webp`
  portrait.alt = characterData.class;

  upperPart.className = 'upperPart';
  upperPart.appendChild(forceDiv);
  upperPart.appendChild(portrait);
  
  
  const lowerPart = document.createElement('div');
  lowerPart.className = 'lowerPart';

  //link SKill creation
  const linkImageLevelDiv = document.createElement('div');
  linkImageLevelDiv.className = 'linkImageLevel';

  const linkspan = document.createElement('span');
  linkspan.className = 'linkLegionTitle';
  linkspan.innerText = 'Link Skill';

  linkSkillData = await fetch('../../public/data/linkskill.json').then(response => response.json());
  filteredLink = linkSkillData.filter(item =>{
    return item.name === characterData.linkSkill;
  })
  const wrapper = document.createElement('div');
  wrapper.className = 'linkWrapper';

  const linkImg = document.createElement('img');
  linkImg.alt = filteredLink[0].name;
  linkImg.src = filteredLink[0].image;
  linkImg.className = 'linkImg';
  const linkLevel = document.createElement('span');
  linkLevel.className = 'linkLevel';

  if (characterData.level > 178 && characterData.code === 'zero') {
    linkLevel.innerText = 'Lv. 5';
  }
  else if (characterData.level >= 210 && filteredLink[0].levels.length > 2) {
    linkLevel.innerText = 'Lv. 3';
  }
  else if (characterData.level >= 120) {
    linkLevel.innerText = 'Lv. 2';
  }
  else if (characterData.level < 120) {
    linkLevel.innerText = 'Lv. 1';
  }

  wrapper.appendChild(linkImg);
  wrapper.appendChild(linkLevel);

  linkImageLevelDiv.appendChild(linkspan);
  linkImageLevelDiv.appendChild(wrapper); 

  //Legion Creation
  const legionDiv = document.createElement('div');
  legionDiv.className = 'legionDiv';
  const legionspan = document.createElement('span');
  legionspan.className = 'linkLegionTitle';
  legionspan.innerText = 'Legion';

  legionData = await fetch('../../public/data/legionsystems.json').then(response => response.json());
  filterLegion = legionData.filter(item =>{
    return item.name === characterData.legion;
  })
  const legionImg = document.createElement('img');
  legionImg.className = 'legionImg';
  legionImg.alt = `${characterData.class} legion`;
  legionRank = getRank(characterData);
  if(legionRank == 'no_rank'){
    legionImg.src = '../../public/assets/legion/no_rank.webp';
  }
  else{
    legionImg.src = `../../public/assets/legion/${characterData.jobType}/rank_${legionRank}.webp`;
  }

  legionDiv.appendChild(legionspan);
  legionDiv.appendChild(legionImg);

  //Appending

  


  const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
  const bossIcon = await loadAndCreateSVG(bossIconpath);
  bossIcon.setAttribute('width', '33');
  bossIcon.setAttribute('height', '25.76');

  
  const characterName = document.createElement('span');
  characterName.className = 'characterName';
  characterName.innerText = characterData.name;

  const nameAndIcon = document.createElement('div');
  nameAndIcon.className = 'nameAndIcon';

  nameAndIcon.appendChild(bossIcon);
  nameAndIcon.appendChild(characterName);

  const job = document.createElement('span');
  job.className = 'job';
  job.innerText = characterData.job;

  const levelSpan = document.createElement('span');
  levelSpan.className = 'level';
  levelSpan.innerText = `${characterData.level}/${characterData.targetLevel}`;
  switch(characterData.jobType){
    case 'mage':
      levelSpan.style.color ='#92BCE3';
      break;

    case 'thief':
      levelSpan.style.color ='#B992E3';
      break;

    case 'warrior':
      levelSpan.style.color ='#E39294';
      break;
    
    case 'bowman':
      levelSpan.style.color ='#96E4A5';
      break;

    case 'pirate':
      levelSpan.style.color ='#E3C192';
      break;                
  } 
  if(characterData.level >= characterData.targetLevel){
    levelSpan.style.color = '#48AA39';
  }
  
  const nameAndLevel = document.createElement('div');
  nameAndLevel.className = 'nameAndLevel';

  nameAndLevel.appendChild(nameAndIcon);
  nameAndLevel.appendChild(job);
  nameAndLevel.appendChild(levelSpan);

//Bar level code

  const levelBarWrapper = document.createElement('div');
  levelBarWrapper.className = 'levelBarWrapper';
  const levelBar = document.createElement('div');
  levelBar.className = 'levelBar';

  const progressBar = document.createElement('div');
  progressBar.className = 'progressBar';
  if(characterData.level == 0){
    progressBar.style.width = 0;
  }
  else{
    const maxWidth = 480;
    let BarSize = (characterData.level / characterData.targetLevel) * maxWidth;

    if(BarSize > maxWidth){
      BarSize = maxWidth;
    }
    progressBar.style.width = BarSize + 'px';
  }

  switch(characterData.jobType){
    case 'mage':
      progressBar.style.backgroundColor  ='#92BCE3';
      break;

    case 'thief':
      progressBar.style.backgroundColor ='#B992E3';
      break;

    case 'warrior':
      progressBar.style.backgroundColor ='#E39294';
      break;
    
    case 'bowman':
      progressBar.style.backgroundColor ='#96E4A5';
      break;

    case 'pirate':
      progressBar.style.backgroundColor ='#E3C192';
      break;                
  } 
  if(characterData.level >= characterData.targetLevel){
    progressBar.style.backgroundColor = '#48AA39';
  }





  //console.log(characterData);


  const linkLegion = document.createElement('div');
  linkLegion.className = 'linkLegionContainer';

  linkLegion.appendChild(linkImageLevelDiv);
  linkLegion.appendChild(legionDiv);



  levelBar.appendChild(progressBar);
  levelBarWrapper.appendChild(levelBar);

  lowerPart.appendChild(linkLegion);
  lowerPart.appendChild(nameAndLevel);
  
  cardBody.className = 'cardBody';
  cardBody.appendChild(upperPart);
  cardBody.appendChild(lowerPart);
  cardBody.appendChild(levelBarWrapper);
  //console.log(characterData);
  
  parentDiv.appendChild(cardBody);
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

async function loadAndCreateSVG(svgFilePath) {
  try {
    const response = await fetch(svgFilePath);
    const svgData = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, 'image/svg+xml');

    const svgElement = doc.querySelector('svg');

    if (svgElement) {
      return svgElement.cloneNode(true);
    } else {
      console.error('No <svg> element found in the SVG file:', svgFilePath);
      return null;
    }
  } catch (error) {
    console.error('Error loading SVG:', error);
    throw error;
  }
}