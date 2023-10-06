document.addEventListener('DOMContentLoaded', async () => {
    await loadPage();


})


function createDiv(className, content) {
	const div = document.createElement('div');

	if (className) {
		div.classList.add(className);
	}

	if (content !== undefined) {
		div.textContent = content;
	}

	return div;
}

function createSpan(className, content) {
	const span = document.createElement('span');

	if (className) {
		span.classList.add(className);
	}

	if (content !== undefined) {
		span.textContent = content;
	}

	return span;
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

    const bossDiv = createDiv('bossDiv');
    
    const bossIconpath = '../../public/assets/icons/menu/boss_slayer.svg';
    const bossIcon = await loadEditableSVGFile(bossIconpath, 'bossIcon');

    const bossSpan = createSpan('bossHunting', 'Boss Hunting');

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
    
}
async function createTotalGain(){
    
}
async function createServerButton(){
    
}
async function createEditBossesButton(){
    
}
  

async function loadCharacterCards(){


}