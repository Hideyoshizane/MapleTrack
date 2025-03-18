const subtitle = document.querySelector('.subtitle');
const usernameSpan = document.querySelector('.usernameSpan');
const username = document.querySelector('.username');
const submitButton = document.querySelector('.sendButton');

window.searchUsername;
window.server;
username.addEventListener('input', function () {
	updateSubmitButtonState();
});

function isValidUsername(username) {
	const minLength = 5;
	const maxLength = 20;
	const alphanumericRegex = /^[a-zA-Z0-9]+$/;

	return username.length >= minLength && username.length <= maxLength && alphanumericRegex.test(username);
}
function updateSubmitButtonState() {
	submitButton.disabled = !isValidUsername(username.value);
}
function updateLevelButtonState() {
	submitButton.disabled = !containsOnlyNumbers(username.value);
}
function containsOnlyNumbers(input) {
	return /^\d+$/.test(input);
}

submitButton.addEventListener('click', usernameInputFunction);

async function usernameInputFunction() {
	try {
		searchUsername = username.value;
		const response = await fetch('/forgotUsername', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username: searchUsername }),
		});
		const result = await response.json();

		if (result.serverName != null) {
			updateTextFields(result.serverName);
			server = result.serverName;
		} else if (result.userFound != null) {
			emptyAccount(searchUsername);
		} else {
			wrongUsername();
		}
	} catch (error) {
		console.error('Error during fetch:', error);
	}
}

function wrongUsername() {
	const errorSpan = createDOMElement('span', 'error', 'Username not found.');
	username.insertAdjacentElement('afterend', DOMPurify.sanitize(errorSpan));
}

function updateTextFields(serverName) {
	subtitle.textContent = DOMPurify.sanitize(
		`For safety, please insert the level of your highest character in the ${serverName} server.`
	);
	usernameSpan.textContent = 'Level';
	username.value = '';
	username.placeholder = 'Character level';

	updateInputListener(updateSubmitButtonState, updateLevelButtonState);
	updateClickListener(usernameInputFunction, levelInputFunction);

	const error = document.querySelector('.error');
	if (error) {
		error.remove();
	}
}

async function levelInputFunction() {
	const response = await fetch('/forgotPasswordLevel', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: searchUsername,
			level: username.value,
		}),
	});
	const result = await response.json();
	result ? updateSuccess() : updateFailed();
}

function updateSuccess() {
	subtitle.textContent = DOMPurify.sanitize(
		`Password updated successfully. The new password is the character name of the highest level character on ${server} server.`
	);
	usernameSpan.remove();
	username.remove();
	submitButton.textContent = 'Return to login';
	updateClickListener(usernameInputFunction, returnButton);
}

function updateFailed() {
	subtitle.textContent = DOMPurify.sanitize(`Password not reseted. Please try again.`);
	usernameSpan.textContent = 'Username';
	username.value = '';
	username.placeholder = 'MapleTrack';
	updateInputListener(updateLevelButtonState, updateSubmitButtonState);

	updateClickListener(levelInputFunction, usernameInputFunction);
}

async function emptyAccount(usernameInput) {
	subtitle.textContent = DOMPurify.sanitize(
		`This account is empty, the password has been reset to default: 1234567 Please change password after login.`
	);
	usernameSpan.remove();
	username.remove();
	await fetch('/resetEmptyAccount', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username: usernameInput }),
	});

	submitButton.textContent = 'Return';
	updateClickListener(usernameInputFunction, returnButton);
}

function returnButton() {
	var url = `/login`;
	window.location.href = url;
}

function updateClickListener(oldfunction, newFunction) {
	submitButton.removeEventListener('click', oldfunction);
	submitButton.addEventListener('click', newFunction);
}

function updateInputListener(oldfunction, newFunction) {
	username.removeEventListener('input', oldfunction);
	username.addEventListener('input', newFunction);
}

const logo = document.querySelector('#logo');

logo.addEventListener('click', () => {
	window.location.href = '/login';
});
