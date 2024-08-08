document.addEventListener('PageLoaded', async () => {
    try {
        setupDropdownToggle();
        await setupCharactersDropdownToggle();
        setupBossClickEvents();
      
        const serverButtons = document.querySelectorAll('.serverButton'); 
          
          serverButtons.forEach(serverButton => {
            serverButton.addEventListener('click', async () => {
              await handleServerButtonClick(serverButton, serverButtons);
            });
          });
      
        const editButton = document.querySelector('.editButton');
        editButton.addEventListener('click', async () => {
          var url = `/editBosses`;
          window.location.href = url;
        });
        await loadFlashMessage();
    }
    catch(error){
      console.error('Error loading:', error);
    }
  
  });

  async function setupCharactersDropdownToggle() {
    document.body.addEventListener('click', async (event) => {
      if(event.target.closest('.BossButton')){
        return;
      }
      if (event.target.closest('.buttonWrapper')) {
        const button = event.target.closest('.buttonWrapper');
        const svgIcon = button.querySelector('.icon');
          button.classList.toggle('open');
          button.classList.toggle('closed');
          svgIcon.classList.toggle('rotate');
          const toggle = button.classList.contains('open') ? true : false;
          await updateGrid(event.target, toggle);
      }
    });
    
  }
  async function updateGrid(buttonWrapper, toggle){
    const body = document.querySelector('body');
    const characterDropdown = document.querySelectorAll('.characterDropdown');
    const grid =  characterDropdown[0].parentElement;
    const quantity = characterDropdown.length;
    const numRows = Math.ceil(quantity/ 3);
  
    if(toggle){
      for (let i = 0; i < characterDropdown.length; i++) {
        if (characterDropdown[i].contains(buttonWrapper)) {
          const startIndexOfLastRow = (numRows - 1) * 3;
          const endIndexOfLastRow = quantity - 1;
          if(i >= startIndexOfLastRow && i <= endIndexOfLastRow && characterDropdown[i].querySelector('.BossButton')){
            const height = (numRows * 144) + 288;
            grid.style.minHeight = height + 'px';
          }
  
          break;
        }
      }
    }else{
      grid.style.transition = 'min-height 0.3s ease-in-out';
      grid.style.minHeight =  '250px';
    }
  }
  
  async function handleServerButtonClick(serverButton, serverButtons) {
      const selectedButton = document.querySelector('.SelectedButton');
      if (server !== serverButton.querySelector('span').innerText) {
          serverButtons.forEach((button) => {
              button.classList.add('notSelected');
              button.classList.remove('selected');
          });
  
          swapContentAndStoreCookie(selectedButton, serverButton);
  
          server = selectedButton.querySelector('span').innerText;
  
          serverButton.classList.toggle('notSelected');
          serverButton.classList.toggle('selected');
          await updateTopButtons();
      }
  }
  
  let isEventProcessing = false;
  function setupBossClickEvents() {
      document.body.addEventListener('click', async (event) => {
      if (isEventProcessing) {
        return;
      }
          if (event.target.closest('.BossButton')) {
        isEventProcessing = true;
              const button = event.target.closest('.BossButton');
  
              const bossName = button.querySelector('.BossName').getAttribute('name');
              const difficult = button.querySelector('.BossName').getAttribute('difficult');
              const value = button.querySelector('.BossValue').getAttribute('value');
              const characterClass = button.closest('.buttonWrapper').querySelector('.characterClass').innerText;
              const date = DateTime.utc().toJSDate();
              const checkMark = button.querySelector('.checked') ? true : false;
              const requestContent = {
                  server: server.charAt(0).toUpperCase() + server.slice(1),
                  username: username,
                  characterClass: characterClass,
                  bossName: bossName,
                  difficult: difficult,
                  value: value,
                  date: date,
                  checkMark: !checkMark,
              };
  
              await fetch('/checkBoss', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestContent),
              }).catch((error) => {
                  console.error('Error:', error);
              });
  
              const checkSVG = checkMark
                  ? button.querySelector('.checked')
                  : button.querySelector('.unchecked');
              const newSVG = checkMark
                  ? await createUncheckMark()
                  : await createCheckMark();
              checkSVG.replaceWith(newSVG);
              await updateCharacterButton(button, !checkMark);
              await updateTopButtons();
          }
      isEventProcessing = false;
      });
  }
  
  async function updateCharacterButton(button, checkMark) {
    const characterButton = button.parentElement.parentElement.querySelector('.characterButton');
    let checks = characterButton.querySelector('.checked');
    let checked = Number(checks.getAttribute('checked'));
    const total = checks.getAttribute('total');
    checked = checkMark ? checked + Number(1) : checked - Number(1);
  
    if(checked == total){
      const checkSVG = await createCheckMark();
      checks.replaceWith(checkSVG);
      characterButton.style.backgroundColor = "#9EE493";
      checks = checkSVG;
    }else{
      checkedSpan = createDOMElement('span', 'checked', `${checked}/${total}`);
      checks.replaceWith(checkedSpan);
      checks = checkedSpan;
      characterButton.style.backgroundColor = "#D7D7D7";
    }
    checks.setAttribute("checked", checked);
    checks.setAttribute("total", total);
    button.style.backgroundColor = checkMark ? "#9EE493": "#D7D7D7";
  
  }
  
  
  async function loadFlashMessage() {
    const type = getCookie('type');
    if(type){
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