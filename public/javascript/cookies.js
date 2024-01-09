function setCookie(name, value, days) {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

	// Check if the cookie is 'selectedServerContent'
	const path = name === 'selectedServerContent' ? '/' : '';

	document.cookie = `${name}=${encodeURIComponent(
		value
	)};expires=${expires.toUTCString()};path=${path}`;
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

async function updateSelectedValuesCookie() {
    sort(selectedValues, true);
    const selectedValuesString = selectedValues.join(',');
    setCookie('filterValues', selectedValuesString, 7);
}


function setCookieFlash(name, value, seconds) {
	const expires = new Date();
	expires.setTime(expires.getTime() + seconds * 1000);
  
	// Check if the cookie is 'selectedServerContent'
	const path = name === 'selectedServerContent' ? '/' : '';
  
	document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=${path}`;
  }

// Set cache control headers for an HTML element
function setCacheControlHeaders(element) {
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const maxAge = 7 * millisecondsInDay;

    // Set cache control headers on the provided element
    element.setAttribute('expires', new Date(Date.now() + maxAge).toUTCString());
    element.setAttribute('cache-control', `max-age=${maxAge / 1000}`);
}
