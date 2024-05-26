function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
    const minLength = 5;
    const maxLength = 20;
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    
    return username.length >= minLength && username.length <= maxLength && alphanumericRegex.test(username);

}

function isValidPassword(password) {
    const minLength = 6;
    return password.length >= minLength && /\d/.test(password);
}

function arePasswordsMatching() {
    const password = document.getElementById('password').value;
    const checkPassword = document.getElementById('checkPassword').value;
    return password === checkPassword && checkPassword.length > 0;
}

const iconBackup = document.querySelector('.info');

function setSvgStyles(svg, opacity, cursor) {
    svg.style.opacity = opacity;
    svg.style.cursor = cursor;
}

const inputIds = ['email', 'username', 'password', 'checkPassword'];

const isValidFunctionMap = {
    email: isValidEmail,
    username: isValidUsername,
    password: isValidPassword,
    checkPassword: arePasswordsMatching
};

function handleValidation(inputElement, isValidFunction, icon) {
    const inputValue = inputElement.value;
    const closestSvg = inputElement.parentElement.querySelector('svg');
    setSvgStyles(closestSvg, '1', 'pointer');

    const isValid = isValidFunction();

    if (isValid) {
        const checkSVG = createCheck();
        closestSvg.replaceWith(checkSVG);
        inputElement.style.outline = '3px solid #7BD96D';
    } else {
        inputElement.style.outline = '3px solid #D14D4D';
        if (closestSvg.classList.contains('check')) {
            const infoSVG = icon.cloneNode(true);
            closestSvg.replaceWith(infoSVG);
        }
    }

    if (inputValue.length === 0) {
        inputElement.style.outline = '0';
        setSvgStyles(closestSvg, '0', 'auto');
    }
}



inputIds.forEach(inputId => {
    const inputElement = document.getElementById(inputId);

    if (inputElement) {
        inputElement.addEventListener('input', function () {
            if (inputId === 'checkPassword') {
                handleValidation(inputElement, arePasswordsMatching, iconBackup);
            } else {
                handleValidation(inputElement, () => isValidFunctionMap[inputId](inputElement.value), iconBackup);
            }
            updateSubmitButtonState();
        });

        inputElement.addEventListener('blur', function () {
            handleBlur(inputElement);
            updateSubmitButtonState();

        });
    }
});

function handleBlur(inputElement) {
    const isValid = isValidFunctionMap[inputElement.id](inputElement.value);
    const svg = inputElement.parentElement.querySelector('svg');
    if (!isValid) {
        svg.setAttribute('fill', "#D14D4D");
    }
};


const wrap = document.querySelectorAll('.wrap');
wrap.forEach(info => {
    info.addEventListener('mouseover', function(event) {
        const targetOpacity = window.getComputedStyle(event.target).opacity;
        if (targetOpacity === '1' && event.target.classList.contains('info')) {
            handleHover(event);
        }
    });
});

wrap.forEach(info => {
    info.addEventListener('mouseout', function(event) {
        if (event.target.classList.contains('info')) {
            handleMouseOut();
        }
    });
});

function handleHover(event) {
    const name = event.currentTarget.querySelector('.input').getAttribute('name');
    const targetRect = event.target.getBoundingClientRect();
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;

    const text = getText(name);
    const tooltip = createDOMElement('div', 'infoTooltip', text);
    tooltip.style.top = `${centerY - 26}px`;
    tooltip.style.left = `${centerX + 21}px`;
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
        case 'email':
            return 'Not a valid email.';
        case 'username':
            return 'Minimum length: 5 characters.';
        case 'password':
            return 'Password not valid. Minimum length: 6 characters, must contain a number.';
        case 'checkPassword':
            return 'Passwords do not match.';
    }
}

function createCheck() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "30");
    svg.setAttribute("height", "30");
    svg.setAttribute("viewBox", "0 0 30 30");
    svg.setAttribute("class", "check");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M21.5027 8.73837L12.1668 18.0742L7.081 13.0025L5.0835 15L12.1668 22.0834L23.5002 10.75L21.5027 8.73837ZM15.0002 0.833374C7.18016 0.833374 0.833496 7.18004 0.833496 15C0.833496 22.82 7.18016 29.1667 15.0002 29.1667C22.8202 29.1667 29.1668 22.82 29.1668 15C29.1668 7.18004 22.8202 0.833374 15.0002 0.833374ZM15.0002 26.3334C8.7385 26.3334 3.66683 21.2617 3.66683 15C3.66683 8.73837 8.7385 3.66671 15.0002 3.66671C21.2618 3.66671 26.3335 8.73837 26.3335 15C26.3335 21.2617 21.2618 26.3334 15.0002 26.3334Z");
    path.setAttribute("fill", "#7BD96D");

    svg.appendChild(path);

    return svg;
}
const submitButton = document.querySelector('.submit');

function isFormValid() {
    for (const inputId of inputIds) {
        const inputElement = document.getElementById(inputId);
        if (!isValidFunctionMap[inputId](inputElement.value)) {
            return false;
        }
    }
    return true;
}

function updateSubmitButtonState() {
    submitButton.disabled = !isFormValid();
    submitButton.value = 'Sign Up';
}


const logo = document.querySelector('#logo');

logo.addEventListener('click', () => {
    window.location.href = '/login';
});