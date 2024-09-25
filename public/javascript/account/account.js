function isValidPassword(password) {
	const minLength = 6;
	return password.length >= minLength && /\d/.test(password);
}

function arePasswordsMatching(password, checkPassword) {
	return password === checkPassword && checkPassword.length > 0;
}

function validatePassword(inputElement, isValidFunction) {
	const inputValue = inputElement.value;
	const isValid = isValidFunction(inputValue);

	if (isValid || inputValue.length === 0) {
		inputElement.style.outline = '3px solid #7BD96D';
	} else {
		inputElement.style.outline = '3px solid #D14D4D';
	}
	if (inputValue.length === 0) {
		inputElement.style.outline = '0';
	}
}

const inputIds = ['password', 'checkPassword'];

inputIds.forEach((inputId) => {
	const inputElement = document.getElementById(inputId);

	if (inputElement) {
		inputElement.addEventListener('input', function () {
			if (inputId === 'checkPassword') {
				validatePassword(inputElement, (value) =>
					arePasswordsMatching(
						value,
						document.getElementById('password').value,
					),
				);
			} else {
				validatePassword(inputElement, isValidPassword);
			}
			updateSubmitButtonState();
		});

		inputElement.addEventListener('blur', function () {
			updateSubmitButtonState();
		});
	}
});

const wrap = [...document.querySelectorAll('.wrap:not(:first-child)')];

wrap.forEach((input) => {
	input.addEventListener('mouseover', function (event) {
		const element = input.querySelector('.input');
		const computedStyle = window.getComputedStyle(element);
		const isValid = computedStyle.outlineColor === 'rgb(123, 217, 109)';
		if (!isValid) {
			handleHover(event);
		}
	});
});

wrap.forEach((input) => {
	input.addEventListener('mouseout', function () {
		handleMouseOut();
	});
});

function handleHover(event) {
	const name = event.currentTarget
		.querySelector('.input')
		.getAttribute('name');
	const targetRect = event.target.getBoundingClientRect();
	const centerX = targetRect.left + targetRect.width / 2;
	const centerY = targetRect.top + targetRect.height / 2;

	const text = getText(name);
	const tooltip = createDOMElement('div', 'infoTooltip', text);
	tooltip.style.top = `${centerY - 24}px`;
	tooltip.style.left = `${centerX + 160}px`;
	document.body.appendChild(tooltip);
}

function handleMouseOut() {
	const tooltip = document.querySelector('.infoTooltip');
	if (tooltip) {
		tooltip.remove();
	}
}

function getText(name) {
	switch (name) {
		case 'password':
			return 'Minimum length: 6 characters, must contain a number.';
		case 'checkPassword':
			return 'Passwords do not match.';
	}
}

submitButton = document.querySelector('.submit');

function updateSubmitButtonState() {
	const oldPassword = document.getElementById('oldPassword');
	const newPassword = document.getElementById('password');
	const checkPassword = document.getElementById('checkPassword');

	const oldPasswordValid = oldPassword.value.length > 0;
	const newPasswordValid = isValidPassword(newPassword.value);
	const checkPasswordValid = arePasswordsMatching(
		newPassword.value,
		checkPassword.value,
	);

	if (oldPasswordValid && newPasswordValid && checkPasswordValid) {
		submitButton.disabled = false;
	} else {
		submitButton.disabled = true;
		submitButton.style.cursor = 'pointer';
	}
}

submitButton.addEventListener('click', function (event) {
	event.preventDefault();
	updatePassword();
});

async function updatePassword() {
	try {
		const oldPassword = document.getElementById('oldPassword');
		const newPassword = document.getElementById('password');

		const response = await fetch('/updatePassword', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				oldPassword: oldPassword.value,
				newPassword: newPassword.value,
			}),
		});
		const result = await response.json();

		const messageText = result
			? 'Password updated successfully.'
			: 'Error, password not updated.';

		const existingMessage = document.querySelector('.message');
		if (existingMessage) {
			existingMessage.remove();
		}
		const message = createDOMElement('span', 'message', messageText);
		submitButton.insertAdjacentElement('afterend', message);
	} catch (error) {
		console.error('Error during fetch:', error);
	}
}
