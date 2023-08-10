async function fetchJSONData() {
    try {
        const response = await fetch('/data/linkskill.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        return null;
    }
}

async function displayData(data) {
    const outputDiv = document.getElementById('output');
    
    const response = await fetch('/data/linkskill.json');
    const jsonData = await response.json();
    for (const item of jsonData) {
        const name = item.name;
        const image = item.image;
        console.log(name);
    }
}

//fetchJSONData().then(displayData);