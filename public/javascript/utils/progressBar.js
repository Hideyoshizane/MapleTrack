
async function createLeveLBar(levelBarData, maxWidth, className){

    const levelBar = createDOMElement('div', className);
    const progressBar = createDOMElement('div', 'progressBar');

    await updateExpBar(progressBar, levelBarData.level, levelBarData.targetLevel, maxWidth, levelBarData.jobType);
    
  
    levelBar.appendChild(progressBar);
    return levelBar;
  }


  const characterColors = {
    mage: { color: '#92BCE3'},
    thief: { color: '#B992E3'},
    xenon: { color: '#B992E3'},
    warrior: { color: '#E39294'},
    bowman: { color: '#96E4A5'},
    pirate: { color: '#E3C192'},
    default: {color: '#9EE493'},
    complete: {color: '#48AA39'}
  };
  

async function updateExpBar(progressBar, level, targetLevel, maxWidth, jobType) {

  let barSize = (level / targetLevel) * maxWidth;
  if (targetLevel === 'MAX') {
    barSize = maxWidth;
  }

  if (barSize > maxWidth) {
    barSize = maxWidth;
  }
  progressBar.style.width = barSize + 'vw';
  const { color } = Number(level) >= Number(targetLevel) ? characterColors["complete"] : characterColors[jobType];
  progressBar.style.backgroundColor = color;
}