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

  document.addEventListener("DOMContentLoaded", () => {
    // Get the search input and search results div
    const searchInput = document.getElementById("search");
    const searchResultsDiv = document.getElementById("searchResults");
    const searchSectionDiv = document.querySelector(".searchSection");
    const userId = document.querySelector("script[data-user-id]").getAttribute("data-user-id");
  
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
            resultDiv.classList.add("result");
            resultDiv.textContent = `Server: ${character.server}: ${character.name} - ${character.class} - Level ${character.level}`;
            searchResultsDiv.appendChild(resultDiv);
          }
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
      // Check if the expanded class has been removed
      if (!searchSectionDiv.classList.contains("expanded")) {
        // Clear search results when transition ends
        searchResultsDiv.innerHTML = "";
      }
    });
  
    // Event listener for clicking away from the search box
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!searchSectionDiv.contains(target) && target !== searchInput) {
        clearSearch();
      }
    });
  });
  