document.addEventListener('PageLoaded', function () {
  try {
    const characterCardDiv = document.querySelector('.characterCards');
    const selectedButton = dropdownToggle.querySelector('.SelectedButton');

    const serverButtons = document.querySelector('.serverSelector').querySelectorAll('.serverButton');     
    for (const serverButton of serverButtons) {
      serverButton.addEventListener('click', async () => {
        await handleServerButtonClick(serverButton, serverButtons, selectedButton, characterCardDiv);
      });
    }

    setupDropdownToggle();

    setupCardClickListeners();

  }
  catch(error){
    console.error('Error loading:', error);
  }

});



async function handleServerButtonClick(serverButton, serverButtons, selectedButton, characterCardDiv) {
  if(selectedButton.textContent !== serverButton.textContent) {
    serverButtons.forEach(button => {
      button.classList.add('notSelected');
      button.classList.remove('selected');
  });

  swapContentAndStoreCookie(selectedButton, serverButton);

  serverButton.classList.toggle('notSelected');
  serverButton.classList.toggle('selected');

  characterCardDiv.innerHTML = '';
  
  await createCharacterCards();
  filterCharacterCards(selectedValues);
  setupCardClickListeners();
  }
}


function setupCardClickListeners() {
  cardBody.forEach((card) => {
    card.addEventListener('click', async () =>{
      const server = document.querySelector('.SelectedButton').querySelector('span').innerText;
      const character = card.getAttribute('characterclass');
      var url = `${username}/${server}/${character}`;
      window.location.href = url;
    });
  });
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
        filterCharacterCards(selectedValues);
        updateSelectedValuesCookie();
    });
});

