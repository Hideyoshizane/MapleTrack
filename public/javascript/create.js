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

async function loadEditableSVGFile(filePath) {
	try {
		const response = await fetch(filePath);
		const svgData = await response.text();

		const svgElement = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'svg'
		);

		svgElement.innerHTML = svgData;

		return svgElement;
	} catch (error) {
		console.error('Error loading SVG file:', error);
		return null;
	}
}
