import { DateTime } from "luxon";

document.addEventListener("DOMContentLoaded", function() {
  const dailyOutput = document.getElementById("daily");
  const weeklyOutput =  document.getElementById("weekly");
  dailyOutput.style.textAlign = "center";
  weeklyOutput.style.textAlign = "center";
    function updateCountdown() {

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
    setInterval(updateCountdown, 1000);

});

  document.addEventListener("DOMContentLoaded", async () => {
    // Get the search input and search results div
    const searchInput = document.getElementById("search");
    const searchResultsDiv = document.getElementById("searchResults");
    const searchSectionDiv = document.querySelector(".searchSection");

    const username = document.querySelector(".username");
    const usernameValue = username.textContent;
    const userId = await fetch(`/username?username=${encodeURIComponent(usernameValue)}`);
    
    // Function to perform the search
    const performSearch = async () => {
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
        const response = await fetch(`/search?query=${query}&userId=${userId}`);
        
  
        // Check the response status
        if (response.status === 404) {
          throw new Error("No results found.");
        }
  
        const characters = await response.json();
  
        // If no results found, display a message
        if (characters.length === 0) {
          const noResultsDiv = document.createElement("div");
          noResultsDiv.classList.add("result");
          noResultsDiv.textContent = "No results found.";
          searchResultsDiv.appendChild(noResultsDiv);
        } else {
          // Create and display the search results
          for (let i = 0; i < Math.min(characters.length, 5); i++) {
            const character = characters[i];
            const resultDiv = document.createElement("div");
            const img = document.createElement("img");
            img.src = `../../assets/icons/servers/${character.server}.webp`;
            resultDiv.classList.add("result");
            resultDiv.appendChild(img);
            resultDiv.setAttribute("data-server", character.server);
            resultDiv.setAttribute("data-code", character.code);
  
            // Create a <span> element for the character details
            const detailsSpan = document.createElement("span");
            detailsSpan.textContent = `\u00A0\u00A0${character.server}: ${character.name} - ${character.class} - Level ${character.level}`;
  
            // Append the <span> to the resultDiv
            resultDiv.appendChild(detailsSpan);
  
            searchResultsDiv.appendChild(resultDiv);
          }
          searchSectionDiv.classList.add("expanded");
        
        }
      } catch (error) {
        console.error("Error performing search:", error);
      }
    };
  
    // Function to clear search results and input when clicking away from the search box
    const clearSearch = () => {
      searchResultsDiv.innerHTML = "";
      searchResultsDiv.style.display = "none";
      searchSectionDiv.classList.remove("expanded");
      searchInput.value = "";
    };
  
    // Event listener for the search input
    searchInput.addEventListener("input", performSearch);
  
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
        clearSearch();
      }
    });
  });
  
  //Search bar results redirect
  document.addEventListener('DOMContentLoaded', function() {
    var searchResults = document.getElementById('searchResults');
    var usernameDiv = document.getElementById('username_block');
    var usernameElement = usernameDiv.querySelector('p');
    
    searchResults.addEventListener('click', function(event) {
      var resultElement = event.target.closest('.result');
      if (resultElement) {
        var username = usernameElement.textContent.trim();
        var characterCode = resultElement.getAttribute('data-code');
        var server = resultElement.getAttribute('data-server');

        var url = `/${username}/${server}/${characterCode}`;
      if(server !== null)
            window.location.href = url; 
      }
    });
  });

  //dropdown menu click event
  (function() {
    const usernameBlock = document.getElementById('username_block');
    const dropdownContent = usernameBlock.querySelector('.dropdown-content');
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
  })();


    //Menu buttons event handlers
    const menuButtons = document.querySelectorAll('.menu-button');

    const fetchData = async (url, method) => {
      try {
          const response = await fetch(url, {
              method,
          });
  
          if (response.ok) {
              return response;
          } else {
              throw new Error(`Request failed with status: ${response.status}`);
          }
      } catch (error) {
          console.error('Error during fetch:', error);
          throw error;
      }
  };

  menuButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
        const redirectUrl = button.getAttribute('data-redirect');   
        try {
            const response = await fetchData(redirectUrl, 'GET');
            window.location.href = redirectUrl;
        } catch (error) {
            console.error('Error during button action:', error);
        }
    });
});