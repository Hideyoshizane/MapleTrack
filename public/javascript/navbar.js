const { DateTime } = luxon;

document.addEventListener("DOMContentLoaded", function() {
  setInterval(updateCountdown, 1000);

  const searchInput = document.getElementById("search");
  const searchResultsDiv = document.getElementById("searchResults");
  const searchSectionDiv = document.querySelector(".searchSection");
  const username = document.getElementById("userdata").getAttribute('data-username');

  searchInput.addEventListener("input", () => {
    performSearch(searchInput, searchResultsDiv, searchSectionDiv, username); 
  });

  // Event listener for transition end
  searchSectionDiv.addEventListener("transitionend", () => {
    if (!searchSectionDiv.classList.contains("expanded")) {
      searchResultsDiv.innerHTML = "";
    }
  });


  //Search bar click away
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!searchSectionDiv.contains(target) && target !== searchInput) {
      clearSearch(searchResultsDiv, searchSectionDiv, searchInput);
    }
  });

  var searchResults = document.getElementById('searchResults'); 
  searchResults.addEventListener('click', function(event) {
    var resultElement = event.target.closest('.result');
    if (resultElement) {
      var characterCode = resultElement.getAttribute('data-code');
      var server = resultElement.getAttribute('data-server');

      var url = `/${username}/${server}/${characterCode}`;
    if(server !== null)
          window.location.href = url; 
    }
  });


});

function updateCountdown() {
  const dailyOutput = document.getElementById("daily");
  const weeklyOutput =  document.getElementById("weekly");
  const now = DateTime.utc();
  let wednesday = DateTime.utc().set({weekday: 4, hour: 0, minute: 0, second: 0, millisecond: 0});
  if (now >= wednesday) {
    wednesday = wednesday.plus({ weeks: 1 });
  }
  const diff = wednesday.diff(now);

  let daily = DateTime.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0});
  daily = daily.plus({days: 1});
  daily = daily.diff(now);

  daily = daily.toFormat("hh:mm:ss");
  const weekly = diff.toFormat("dd:hh:mm:ss");
  
  weeklyOutput.innerHTML = `Until Week Reset<br> ${weekly}`;
  dailyOutput.innerHTML = `Until Daily Reset<br> ${daily}`;
}

async function performSearch(searchInput, searchResultsDiv, searchSectionDiv, username){
  // Get the search query
  const query = searchInput.value.trim();

  // If the query is empty, hide the search results div and return
  if (query === "") {
    searchResultsDiv.style.display = "none";
    searchSectionDiv.classList.remove("expanded");
    return;
  }

  // Clear previous search results
  searchResultsDiv.innerHTML = "";
  searchResultsDiv.style.display = "block";
  searchSectionDiv.classList.add("expanded");

  // Send a request to the server to search for characters
  try {
    const characters = await (await fetch(`/search?query=${query}&username=${username}`)).json();
    await createSearchResults(characters, searchResultsDiv);
    searchSectionDiv.classList.add("expanded");

  } catch (error) {
    console.error("Error performing search:", error);
  }
};

async function createSearchResults(characters, parentDiv){
  if (characters.length == 0) {
    parentDiv.appendChild(createDOMElement('div', 'result', 'No result found.'));
  }
  else {
    for(const characterData of characters){
      const resultDiv = createDOMElement('div',"result");
      resultDiv.setAttribute("data-server", characterData.server);
      resultDiv.setAttribute("data-code", characterData.code);

      const img = await createImageElement(`../../assets/icons/servers/${characterData.server}.webp`);
      const detailsSpan = createDOMElement('span', '', `\u00A0\u00A0${characterData.server}: ${characterData.name} - ${characterData.class} - Level ${characterData.level}`);
      
      resultDiv.appendChild(img);
      resultDiv.appendChild(detailsSpan);
      parentDiv.appendChild(resultDiv);
    }
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

function clearSearch(searchResultsDiv, searchSectionDiv, searchInput){
  searchResultsDiv.innerHTML = "";
  searchResultsDiv.style.display = "none";
  searchSectionDiv.classList.remove("expanded");
  searchInput.value = "";
};

//dropdown menu click event
const usernameBlock = document.getElementById('usernameBlock');
const dropdownContent = usernameBlock.querySelector('.dropdownContent');
const svgIcon = usernameBlock.querySelector('#icon');
let isOpen = false;

usernameBlock.addEventListener('click', function() {
    if (isOpen) {
        dropdownContent.classList.remove('open');
        dropdownContent.classList.add('closed');
        svgIcon.classList.remove('rotate');
    } else {
        dropdownContent.classList.remove('closed');
        dropdownContent.classList.add('open');
        svgIcon.classList.add('rotate');
    }
    isOpen = !isOpen;
});


//Menu buttons event handlers
document.addEventListener('DOMContentLoaded', () => {
  const menuButtons = document.querySelectorAll('.menuButton');
  menuButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const redirectUrl = button.getAttribute('data-redirect');
      
      try {
        const response = await fetch(redirectUrl, { method: 'GET' });

        if (response.ok) {
          window.location.href = redirectUrl;
        } else {
          console.error('Request was not successful.');
        }
      } catch (error) {
        console.error('Error during button action:', error);
      }
    });
  });
});
